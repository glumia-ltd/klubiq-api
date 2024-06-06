import { MailerSendService } from '@app/common/email/email.service';
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { replace, split } from 'lodash';
import { ClsService } from 'nestjs-cls';
import { Inject } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import * as admin from 'firebase-admin';
import { FirebaseException } from '../exception/firebase.exception';
import { OrgUserSignUpDto } from '../dto/user-login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SignUpResponseDto } from '../dto/auth-response.dto';
import { EntityManager } from 'typeorm';
import { OrganizationRepository } from '../../../../apps/klubiq-dashboard/src/organization/organization.repository';
import { OrganizationRole } from '@app/common/database/entities/organization-role.entity';
import { Role } from '@app/common/database/entities/role.entity';
import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import {
	CacheKeys,
	CreateUserEventTypes,
	UserRoles,
} from '@app/common/config/config.constants';
import { UserProfilesRepository } from '@app/common/repositories/user-profiles.repository';
import { EmailTemplates } from '@app/common/email/types/email.types';
import { ErrorMessages } from '@app/common/config/error.constant';
import { Organization } from '../../../../apps/klubiq-dashboard/src/organization/entities/organization.entity';
import { OrganizationUser } from '../../../../apps/klubiq-dashboard/src/users/entities/organization-user.entity';
import { Mapper } from '@automapper/core';
import { FirebaseErrorMessageHelper } from '../helpers/firebase-error-helper';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CacheService } from '@app/common/services/cache.service';
import {
	OrgRoleResponseDto,
	ViewSystemRoleDto,
} from '@app/common/dto/responses/org-role.dto';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { AuthService } from './auth.service';

@Injectable()
export class LandlordAuthService extends AuthService {
	private readonly emailVerificationBaseUrl: string;
	private readonly emailAuthContinueUrl: string;
	protected readonly logger = new Logger(LandlordAuthService.name);
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		@Inject('FIREBASE_ADMIN') firebaseAdminApp: admin.app.App,
		@InjectMapper('MAPPER') mapper: Mapper,
		private emailService: MailerSendService,
		private readonly organizationRepository: OrganizationRepository,
		userProfilesRepository: UserProfilesRepository,
		protected readonly errorMessageHelper: FirebaseErrorMessageHelper,
		protected readonly configService: ConfigService,
		httpService: HttpService,
		cls: ClsService<SharedClsStore>,
	) {
		super(
			firebaseAdminApp,
			mapper,
			userProfilesRepository,
			errorMessageHelper,
			configService,
			httpService,
			cls,
		);
		this.emailVerificationBaseUrl = this.configService.get<string>(
			'EMAIL_VERIFICATION_BASE_URL',
		);
		this.emailAuthContinueUrl =
			this.configService.get<string>('CONTINUE_URL_PATH');
	}

	async createOrgUser(
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
				const userProfile = await this.createUserWithOrganization(
					fireUser,
					createUserDto,
					CreateUserEventTypes.CREATE_ORG_USER,
				);

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
			await this.deleteUser(fbid);
			throw new FirebaseException(error);
		}
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
					this.emailVerificationBaseUrl,
					this.emailAuthContinueUrl,
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
			const errorMessage = firebaseErrorMessage
				? firebaseErrorMessage
				: err.message;

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
						this.emailVerificationBaseUrl,
						this.emailAuthContinueUrl,
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
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	async createCustomToken(firebaseId: string): Promise<any> {
		try {
			const jwtToken = await this.auth.createCustomToken(firebaseId);
			return jwtToken;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	private async getSystemRole(entityManager: EntityManager): Promise<Role> {
		return await entityManager.findOne(Role, {
			where: { name: UserRoles.LANDLORD },
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

	// PRIVATE METHOD FOR GETTING ORGANIZATION. WHILE CREATING A NEW LANDLORD USER
	private async findOrCreateOrganization(
		name: string,
		entityManager: EntityManager,
		createEventType: CreateUserEventTypes,
	): Promise<Organization> {
		try {
			if (createEventType === CreateUserEventTypes.CREATE_ORG_USER) {
				const newOrganization = new Organization();
				newOrganization.name = name;
				return entityManager.save(newOrganization);
			} else if (createEventType === CreateUserEventTypes.INVITE_ORG_USER) {
				const existingOrganization = await entityManager.findOne(Organization, {
					where: { name: name },
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

	private async createUserWithOrganization(
		fireUser: any,
		createUserDto: OrgUserSignUpDto,
		createEventType: CreateUserEventTypes,
	): Promise<UserProfile> {
		const entityManager = this.organizationRepository.manager;
		return entityManager.transaction(async (transactionalEntityManager) => {
			const organization = await this.findOrCreateOrganization(
				createUserDto.companyName,
				transactionalEntityManager,
				createEventType,
			);

			const systemRole =
				(await this.cacheService.getCacheByIdentifier<ViewSystemRoleDto>(
					CacheKeys.SYSTEM_ROLES,
					'name',
					UserRoles.LANDLORD,
				)) ?? (await this.getSystemRole(transactionalEntityManager));
			const cachedOrgRole =
				await this.cacheService.getCacheByIdentifier<OrgRoleResponseDto>(
					CacheKeys.ORG_ROLES,
					'name',
					UserRoles.ORG_OWNER,
				);
			const organizationRole = !!cachedOrgRole
				? { id: cachedOrgRole.id, name: cachedOrgRole.name }
				: await this.getOrgRole(
						transactionalEntityManager,
						UserRoles.ORG_OWNER,
					);

			const user = new OrganizationUser();
			user.firstName = createUserDto.firstName;
			user.lastName = createUserDto.lastName;
			user.firebaseId = fireUser.uid;
			user.organization = organization;
			user.orgRole = organizationRole;

			const userProfile = new UserProfile();
			userProfile.email = createUserDto.email;
			userProfile.firebaseId = fireUser.uid;
			userProfile.organizationUser = user;
			userProfile.systemRole = systemRole;
			userProfile.isPrivacyPolicyAgreed = true;
			userProfile.isTermsAndConditionAccepted = true;

			await transactionalEntityManager.save(user);
			await transactionalEntityManager.save(userProfile);
			await this.setCustomClaims(userProfile.firebaseId, {
				systemRole: systemRole.name,
				organizationRole: organizationRole.name,
				organizationId: organization.organizationUuid,
			});
			return userProfile;
		});
	}

	override getActionCodeSettings(baseUrl: string, continueUrl: string) {
		return {
			url: `${baseUrl}${continueUrl}`,
		};
	}
}
