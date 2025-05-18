import { ZohoEmailService } from '@app/common/email/zoho-email.service';
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	PreconditionFailedException,
} from '@nestjs/common';
import { map, replace, split } from 'lodash';
import { ClsService } from 'nestjs-cls';
import { Inject } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import * as admin from 'firebase-admin';
import { FirebaseException } from '../exception/firebase.exception';
import {
	InviteUserDto,
	OrganizationCountryDto,
	OrgUserSignUpDto,
} from '../dto/requests/user-login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SignUpResponseDto } from '../dto/responses/auth-response.dto';
import { EntityManager } from 'typeorm';
import { OrganizationRepository } from '../../../../apps/klubiq-dashboard/src/organization/repositories/organization.repository';
import { OrganizationRole } from '@app/common/database/entities/organization-role.entity';
import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import {
	CacheKeys,
	CreateUserEventTypes,
	OrganizationType,
	UserRoles,
} from '@app/common/config/config.constants';
import { UserProfilesRepository } from '@app/common/repositories/user-profiles.repository';
import { EmailTemplates } from '@app/common/email/types/email.types';
import { ErrorMessages } from '@app/common/config/error.constant';
import { Organization } from '@app/common/database/entities/organization.entity';
import { OrganizationUser } from '@app/common/database/entities/organization-user.entity';
import { Mapper } from '@automapper/core';
import { FirebaseErrorMessageHelper } from '../helpers/firebase-error-helper';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { AuthService } from './auth.service';
import { UserInvitation } from '@app/common/database/entities/user-invitation.entity';
import { DateTime } from 'luxon';
import { OrganizationSettings } from '@app/common/database/entities/organization-settings.entity';
import { OrganizationSubscriptionService } from '@app/common/services/organization-subscription.service';
import { OrganizationSubscriptions } from '@app/common/database/entities/organization-subscriptions.entity';
import { SubscriptionPlan } from '@app/common/database/entities/subscription-plan.entity';
import { SubscriptionPlanDto } from '@app/common/dto/responses/subscription-plan.dto';
import ShortUniqueId from 'short-unique-id';
import { OrganizationSettingsService } from '@app/common/services/organization-settings.service';
import { UserPreferencesService } from '@app/common/services/user-preferences.service';
import { NotificationsSubscriptionService } from '@app/notifications/services/notifications-subscription.service';
import { Generators } from '@app/common/helpers/generators';
import { TenantRepository } from '@app/common/repositories/tenant.repository';
import { ApiDebugger } from '@app/common/helpers/debug-loggers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccessControlService } from './access-control.service';
import { Util } from '@app/common/helpers/util';
@Injectable()
export class LandlordAuthService extends AuthService {
	private readonly landlordEmailVerificationBaseUrl: string;
	private readonly landlordEmailAuthContinueUrl: string;
	protected readonly timestamp = DateTime.utc().toSQL({ includeOffset: false });
	protected readonly logger = new Logger(LandlordAuthService.name);
	protected readonly suid = new ShortUniqueId();
	protected readonly landlordRoleId: number;
	protected readonly orgOwnerRoleId: number;
	// protected readonly generators = new Generators(this.configService);
	constructor(
		@Inject(CACHE_MANAGER) protected cacheManager: Cache,
		@Inject('FIREBASE_ADMIN') firebaseAdminApp: admin.app.App,
		@InjectMapper('MAPPER') mapper: Mapper,
		protected readonly emailService: ZohoEmailService,
		private readonly organizationRepository: OrganizationRepository,
		userProfilesRepository: UserProfilesRepository,
		protected readonly errorMessageHelper: FirebaseErrorMessageHelper,
		protected readonly configService: ConfigService,
		httpService: HttpService,
		protected readonly cls: ClsService<SharedClsStore>,
		protected readonly organizationSubscriptionService: OrganizationSubscriptionService,
		protected readonly organizationSettingsService: OrganizationSettingsService,
		protected readonly userPreferencesService: UserPreferencesService,
		protected readonly notificationSubService: NotificationsSubscriptionService,
		protected readonly tenantRepository: TenantRepository,
		protected readonly generators: Generators,
		protected readonly apiDebugger: ApiDebugger,
		protected readonly eventEmitter: EventEmitter2,
		protected readonly accessControlService: AccessControlService,
		protected readonly util: Util,
	) {
		super(
			firebaseAdminApp,
			mapper,
			cacheManager,
			userProfilesRepository,
			errorMessageHelper,
			configService,
			httpService,
			cls,
			organizationSettingsService,
			userPreferencesService,
			organizationSubscriptionService,
			notificationSubService,
			tenantRepository,
			emailService,
			generators,
			apiDebugger,
			eventEmitter,
			accessControlService,
			util,
		);
		this.landlordEmailVerificationBaseUrl = this.configService.get<string>(
			'EMAIL_VERIFICATION_BASE_URL',
		);
		this.landlordEmailAuthContinueUrl =
			this.configService.get<string>('CONTINUE_URL_PATH');
		this.landlordRoleId = this.configService.get<number>('LANDLORD_ROLE_ID');
		this.orgOwnerRoleId = this.configService.get<number>('ORG_OWNER_ROLE_ID');
	}

	// STEP 1
	async createOrgOwner(
		createUserDto: OrgUserSignUpDto,
	): Promise<SignUpResponseDto> {
		const displayName = `${createUserDto.firstName} ${createUserDto.lastName}`;
		let fbid = '';
		try {
			const fireUser = await this.createUser({
				email: createUserDto.email,
				password: createUserDto.password,
				displayName: displayName,
			});
			if (fireUser) {
				fbid = fireUser.uid;
				const userProfile = (await this.createUserWithOrganization(
					CreateUserEventTypes.CREATE_ORG_USER,
					fireUser,
					createUserDto,
					null,
				)) as UserProfile;
				if (!userProfile) {
					throw new FirebaseException(ErrorMessages.USER_NOT_CREATED);
				}
				await this.sendVerificationEmail(
					createUserDto.email,
					createUserDto.firstName,
					createUserDto.lastName,
				);
				fbid = null;
				return await this.createCustomToken(userProfile.firebaseId);
			}
			throw new FirebaseException(ErrorMessages.USER_NOT_CREATED);
		} catch (error) {
			await this.deleteFailedUser(fbid);
			await this.deleteUser(fbid);
			throw new FirebaseException(error);
		}
	}

	async deleteFailedUser(fbid: string) {
		try {
			const entityManager = this.organizationRepository.manager;
			return entityManager.transaction(async (transactionalEntityManager) => {
				const userProfile = await transactionalEntityManager.findOne(
					UserProfile,
					{
						where: { firebaseId: fbid },
					},
				);
				if (userProfile) {
					const orgUser = await transactionalEntityManager.findOne(
						OrganizationUser,
						{
							where: { profile: { profileUuid: userProfile.profileUuid } },
							relations: ['organization'],
						},
					);
					await transactionalEntityManager.update(
						Organization,
						{
							organizationUuid: orgUser.organization.organizationUuid,
						},
						{
							tenantId: null,
							csrfSecret: null,
							isActive: false,
							isDeleted: true,
							deletedDate: this.timestamp,
						},
					);
					await transactionalEntityManager.delete(OrganizationUser, {
						organizationUserUuid: orgUser.organizationUserUuid,
					});
					await transactionalEntityManager.delete(UserProfile, {
						firebaseId: fbid,
					});
				}
			});
		} catch (error) {
			this.logger.error('Error deleting user:', error);
		}
	}

	async createCustomToken(firebaseId: string): Promise<any> {
		try {
			return await this.auth.createCustomToken(firebaseId);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	//PRIVATE METHODS

	private async getBasicSubscription(
		entityManager: EntityManager,
	): Promise<SubscriptionPlan> {
		return await entityManager.findOne(SubscriptionPlan, {
			where: { name: 'Basic' },
		});
	}

	private async getOrgRole(
		entityManager: EntityManager,
		roleName: UserRoles,
	): Promise<OrganizationRole> {
		return await entityManager.findOne(OrganizationRole, {
			where: { name: roleName },
		});
	}

	// Finds or creates organization
	private async findOrCreateOrganization(
		name: string,
		entityManager: EntityManager,
		createEventType: CreateUserEventTypes,
		orgCountryDto?: OrganizationCountryDto,
	): Promise<Organization> {
		try {
			if (createEventType === CreateUserEventTypes.CREATE_ORG_USER) {
				const newOrganization = new Organization();
				if (name && name.length > 0) {
					newOrganization.name = name;
					newOrganization.orgType = OrganizationType.COMPANY;
				} else {
					newOrganization.orgType = OrganizationType.INDIVIDUAL;
				}
				try {
					newOrganization.tenantId = this.generators.generateSecureULID();
					newOrganization.csrfSecret = this.generators.generateCsrfSecret();
				} catch (err) {
					throw new Error('Tenant ID or CSRF Secret not generated');
				}
				if (orgCountryDto) {
					newOrganization.country = orgCountryDto.name;
					newOrganization.countryPhoneCode = orgCountryDto.dialCode;
					const orgSettings = {
						currency: orgCountryDto.currency,
						currencySymbol: orgCountryDto.currencySymbol,
						countryCode: orgCountryDto.code,
						language: orgCountryDto.language,
					};
					newOrganization.settings = new OrganizationSettings();
					newOrganization.settings.settings = orgSettings;
				}
				const basicSubscription = await this.getBasicPlanInfo(entityManager);
				if (basicSubscription) {
					newOrganization.subscriptions = [basicSubscription];
				}
				return entityManager.save(newOrganization);
			} else if (createEventType === CreateUserEventTypes.INVITE_ORG_USER) {
				const organizationId =
					this.cls.get('currentUser.organizationId') || null;
				const existingOrganization = await entityManager.findOne(Organization, {
					where: { name: name, organizationUuid: organizationId },
				});
				if (!existingOrganization) {
					throw new NotFoundException('Organization not found');
				}
				return existingOrganization;
			}
		} catch (err) {
			throw new BadRequestException(err.message);
		}
	}

	//CREATES OR INVITE USER TO AN ORGANIZATION
	// STEP 2
	private async createUserWithOrganization(
		createEventType: CreateUserEventTypes,
		fireUser: any,
		createUserDto?: OrgUserSignUpDto,
		invitedUserDto?: InviteUserDto,
	): Promise<UserInvitation | UserProfile> {
		switch (createEventType) {
			case CreateUserEventTypes.CREATE_ORG_USER:
				const userProfile = await this.createOrganizationOwner(
					fireUser,
					createUserDto,
					createEventType,
				);
				return userProfile;
			case CreateUserEventTypes.INVITE_ORG_USER:
				return await this.inviteOrganizationUser(
					fireUser,
					invitedUserDto,
					createEventType,
				);
		}
	}
	private async getBasicPlanInfo(
		entityManager: EntityManager,
	): Promise<OrganizationSubscriptions> {
		const basicPlan =
			(await this.cacheService.getCacheByIdentifier<SubscriptionPlanDto>(
				CacheKeys.SUBSCRIPTION_PLANS,
				'name',
				'Basic',
			)) ?? (await this.getBasicSubscription(entityManager));
		if (basicPlan) {
			const subscriptionInfo = new OrganizationSubscriptions();
			subscriptionInfo.subscription_plan_id = basicPlan.id;
			subscriptionInfo.duration = 'monthly';
			subscriptionInfo.is_active = true;
			subscriptionInfo.auto_renew = true;
			subscriptionInfo.is_free_trial = true;
			subscriptionInfo.start_date = DateTime.utc().toJSDate();
			subscriptionInfo.end_date = DateTime.utc().plus({ months: 1 }).toJSDate();
			subscriptionInfo.payment_status = 'pending';
			subscriptionInfo.price = basicPlan.monthly_price;
			return subscriptionInfo;
		}
		return null;
	}
	private async getRolesPermission(
		orgRole: OrganizationRole,
	): Promise<string[]> {
		return orgRole.roleFeaturePermissions?.map((fp) => {
			return `${fp.featurePermission.feature.name}:${fp.featurePermission.permission.name}`;
		});
	}
	private async inviteOrganizationUser(
		fireUser: any,
		invitedUserDto: InviteUserDto,
		createEventType: CreateUserEventTypes,
	): Promise<UserInvitation> {
		const entityManager = this.organizationRepository.manager;
		return entityManager.transaction(async (transactionalEntityManager) => {
			const organization = await this.findOrCreateOrganization(
				invitedUserDto.organizationName,
				transactionalEntityManager,
				createEventType,
			);
			const orgRole = await transactionalEntityManager.findOneBy(
				OrganizationRole,
				{ id: invitedUserDto.orgRoleId },
			);

			const user = new OrganizationUser();
			user.organization = organization;
			user.orgRole = orgRole;

			/// USER PROFILE DATA
			const userProfile = new UserProfile();
			userProfile.email = invitedUserDto.email;
			userProfile.firstName = invitedUserDto.firstName;
			userProfile.lastName = invitedUserDto.lastName;
			userProfile.firebaseId = fireUser.uid;
			userProfile.organizationUser = user;
			userProfile.isPrivacyPolicyAgreed = true;
			userProfile.isTermsAndConditionAccepted = true;
			userProfile.propertiesOwned = invitedUserDto.propertiesToOwn
				? [...invitedUserDto.propertiesToOwn]
				: null;
			userProfile.propertiesManaged = invitedUserDto.propertiesToManage
				? [...invitedUserDto.propertiesToManage]
				: null;

			/// INVITATION DATA
			const invitation = new UserInvitation();
			invitation.organization = organization;
			invitation.firebaseUid = fireUser.uid;
			invitation.orgRole = orgRole;
			invitation.invitedAt = this.timestamp;
			invitation.propertyToManageIds = invitedUserDto.propertiesToManage
				? map(invitedUserDto.propertiesToManage, 'uuid')
				: null;
			invitation.propertyToOwnIds = invitedUserDto.propertiesToOwn
				? map(invitedUserDto.propertiesToOwn, 'uuid')
				: null;
			invitation.token = await this.getInvitationToken();
			/// TRANSACTION SAVES DATA
			await transactionalEntityManager.save(user);
			await transactionalEntityManager.save(userProfile);
			await transactionalEntityManager.save(invitation);
			await this.setCustomClaims(userProfile.firebaseId, {
				kUid: userProfile.profileUuid,
				organizationRole: invitation.orgRole.name,
				organizationId: organization.organizationUuid,
			});
			return invitation;
		});
	}

	// CREATES THE ORGANIZATION OWNER
	// STEP 3
	private async createOrganizationOwner(
		fireUser: any,
		createUserDto: OrgUserSignUpDto,
		createEventType: CreateUserEventTypes,
	): Promise<UserProfile> {
		this.apiDebugger.info(`Creating org owner profile for: ${fireUser}`);
		const entityManager = this.organizationRepository.manager;
		try {
			return entityManager.transaction(async (transactionalEntityManager) => {
				const organization = await this.findOrCreateOrganization(
					createUserDto.companyName,
					transactionalEntityManager,
					createEventType,
					createUserDto.organizationCountry,
				);

				/// CREATE ORGANIZATION USER
				const user = new OrganizationUser();
				user.organization = organization;
				user.orgRole = createUserDto.role;

				///CREATE NEW USER PROFILE
				const userProfile = new UserProfile();
				userProfile.firstName = createUserDto.firstName;
				userProfile.lastName = createUserDto.lastName;
				userProfile.email = createUserDto.email;
				userProfile.firebaseId = fireUser.uid;
				userProfile.organizationUser = user;
				userProfile.isPrivacyPolicyAgreed = true;
				userProfile.isTermsAndConditionAccepted = true;

				await transactionalEntityManager.save(user);
				await transactionalEntityManager.save(userProfile);
				// await this.subscribeOrgToBasicPlan(organization, transactionalEntityManager);
				await this.setCustomClaims(userProfile.firebaseId, {
					kUid: userProfile.profileUuid,
					organizationRole: createUserDto.role.name,
					organizationId: organization.organizationUuid,
					tenantId: organization.tenantId,
				});
				return userProfile;
			});
		} catch (error) {
			throw new BadRequestException(
				'An organization with this name already exists. Please use a different name or login to your existing organization.',
			);
		}
	}

	// OVERRIDE METHODS

	override getActionCodeSettings(baseUrl: string, continueUrl: string) {
		return {
			url: `${baseUrl}${continueUrl}`,
		};
	}

	override async generatePasswordResetEmail(email: string): Promise<void> {
		try {
			const user = await this.auth.getUserByEmail(email);
			const name = split(user.displayName, ' ');
			if (!user) {
				throw new NotFoundException('User not found');
			}
			let resetPasswordLink = await this.auth.generatePasswordResetLink(
				email,
				this.getActionCodeSettings(
					this.landlordEmailVerificationBaseUrl,
					this.landlordEmailAuthContinueUrl,
				),
			);
			resetPasswordLink += `&email=${email}`;
			const actionUrl = replace(resetPasswordLink, '_auth_', 'reset-password');
			const emailTemplate = EmailTemplates['password-reset'];
			await this.emailService.sendTransactionalEmail(
				{
					email,
					firstName: name.length > 0 ? name[0] : '',
					lastName: name.length > 1 ? name[1] : '',
				},
				actionUrl,
				emailTemplate,
			);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			const errorMessage = firebaseErrorMessage || err.message;

			this.logger.error('Error generating password reset email:', err);

			throw new FirebaseException(errorMessage);
		}
	}

	override async sendVerificationEmail(
		email: string,
		firstName: string,
		lastName: string,
	): Promise<void> {
		try {
			const verificationLink = await admin
				.auth()
				.generateEmailVerificationLink(
					email,
					this.getActionCodeSettings(
						this.landlordEmailVerificationBaseUrl,
						this.landlordEmailAuthContinueUrl,
					),
				);
			const actionUrl = replace(verificationLink, '_auth_', 'verify-email');
			const emailTemplate = EmailTemplates['email-verification'];
			await this.emailService.sendTransactionalEmail(
				{ email, firstName, lastName },
				actionUrl,
				emailTemplate,
			);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	// THIS IS TO SEND INVITATION EMAIL TO A USER ADDED TO AN ORGANIZATION
	override async sendInvitationEmail(
		invitedUserDto: InviteUserDto,
		invitation: UserInvitation,
	): Promise<void> {
		try {
			let resetPasswordLink = await this.auth.generatePasswordResetLink(
				invitedUserDto.email,
				this.getActionCodeSettings(
					this.landlordEmailVerificationBaseUrl,
					this.landlordEmailAuthContinueUrl,
				),
			);
			resetPasswordLink += `&email=${invitedUserDto.email}&type=user-invitation&invited_as=${invitation.orgRole.name}&token=${invitation.token}`;
			const actionUrl = replace(resetPasswordLink, '_auth_', 'reset-password');
			const emailTemplate = EmailTemplates['org-user-invite'];
			await this.emailService.sendTransactionalEmail(
				{
					email: invitedUserDto.email,
					firstName: invitedUserDto.firstName,
					lastName: invitedUserDto.lastName,
				},
				actionUrl,
				emailTemplate,
				{
					organization_name: invitation.organization.name,
					expires_after: '72hrs',
				},
			);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	// THIS CREATES THE INVITED USER IN FIREBASE, ADDS AN INVITATION RECORD IN THE INVITATION TABLE & OUR DB
	override async inviteUser(invitedUserDto: InviteUserDto): Promise<any> {
		let fbid: string;
		try {
			const organizationId = this.cls.get('currentUser.organizationId');
			if (!this.organizationSubscriptionService.canAddUser(organizationId, 1)) {
				throw new PreconditionFailedException(ErrorMessages.USER_LIMIT_REACHED);
			}
			const fireUser = await this.createInvitedUser(invitedUserDto);
			if (fireUser) {
				fbid = fireUser.uid;
				const userInvitation = (await this.createUserWithOrganization(
					CreateUserEventTypes.INVITE_ORG_USER,
					fireUser,
					null,
					invitedUserDto,
				)) as UserInvitation;
				await this.sendInvitationEmail(invitedUserDto, userInvitation);
				fbid = null;
			} else {
				throw new FirebaseException(ErrorMessages.USER_NOT_CREATED);
			}
		} catch (error) {
			await this.deleteUser(fbid);
			throw new FirebaseException(error);
		}
	}
}
