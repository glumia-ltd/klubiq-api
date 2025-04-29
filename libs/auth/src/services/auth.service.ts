import {
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
	Inject,
	BadRequestException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import * as admin from 'firebase-admin';
import * as auth from 'firebase-admin/auth';
import { getAppCheck } from 'firebase-admin/app-check';
import { FirebaseException } from '../exception/firebase.exception';
import {
	InviteUserDto,
	ResetPasswordDto,
	TenantSignUpDto,
} from '../dto/requests/user-login.dto';
import {
	LandlordUserDetailsResponseDto,
	TokenResponseDto,
	SignInByFireBaseResponseDto,
} from '../dto/responses/auth-response.dto';
import {
	LeaseStatus,
	ROLE_ALIAS,
	UserRoles,
} from '@app/common/config/config.constants';
import { UserProfilesRepository } from '@app/common/repositories/user-profiles.repository';
import { ErrorMessages } from '@app/common/config/error.constant';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { FirebaseErrorMessageHelper } from '../helpers/firebase-error-helper';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { createHmac } from 'crypto';
import { UserInvitation } from '@app/common/database/entities/user-invitation.entity';
import { ActiveUserData, RolesAndEntitlements } from '../types/firebase.types';
import { plainToInstance } from 'class-transformer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from '@app/common/services/cache.service';
import ShortUniqueId from 'short-unique-id';
import { DateTime } from 'luxon';
import { OrganizationSettingsService } from '@app/common/services/organization-settings.service';
import { UserPreferencesService } from '@app/common/services/user-preferences.service';
import { OrganizationSubscriptionService } from '@app/common/services/organization-subscription.service';
import { NotificationsSubscriptionService } from '@app/notifications/services/notifications-subscription.service';
import { TenantRepository } from '@app/common/repositories/tenant.repository';
import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import { TenantUser } from '@app/common/database/entities/tenant.entity';
import { EntityManager } from 'typeorm';
import { generateString } from '@nestjs/typeorm';
import { TenantInvitation } from '@app/common/database/entities/tenant-invitation.entity';
import { replace } from 'lodash';
import { EmailTemplates } from '@app/common/email/types/email.types';
import { MailerSendService } from '@app/common/email/email.service';
import { OnboardingLeaseDto } from 'apps/klubiq-dashboard/src/lease/dto/requests/create-lease.dto';
import { Lease } from '@app/common/database/entities/lease.entity';
import { Unit } from '@app/common/database/entities/unit.entity';
import { LeasesTenants } from '@app/common/database/entities/leases-tenants.entity';
import { Generators } from '@app/common/helpers/generators';

@Injectable()
export abstract class AuthService {
	protected abstract readonly logger: Logger;
	private readonly adminIdentityTenantId: string;
	private readonly cacheKeyPrefix = 'auth';
	private readonly cacheTTL = 90;
	protected readonly cacheService = new CacheService(this.cacheManager);
	protected readonly suid = new ShortUniqueId();
	protected readonly timestamp = DateTime.utc().toSQL({ includeOffset: false });
	private currentUser: ActiveUserData;
	protected readonly tenantEmailVerificationBaseUrl: string;
	protected readonly tenantEmailAuthContinueUrl: string;
	constructor(
		@Inject('FIREBASE_ADMIN') protected firebaseAdminApp: admin.app.App,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) protected cacheManager: Cache,
		private readonly userProfilesRepository: UserProfilesRepository,
		protected readonly errorMessageHelper: FirebaseErrorMessageHelper,
		protected readonly configService: ConfigService,
		private readonly httpService: HttpService,
		protected readonly cls: ClsService<SharedClsStore>,
		protected readonly organizationSettingsService: OrganizationSettingsService,
		protected readonly userPreferencesService: UserPreferencesService,
		protected readonly organizationSubscriptionService: OrganizationSubscriptionService,
		protected readonly notificationSubService: NotificationsSubscriptionService,
		protected readonly tenantRepository: TenantRepository,
		protected readonly emailService: MailerSendService,
		protected readonly generators: Generators,
	) {
		this.adminIdentityTenantId = this.configService.get<string>(
			'ADMIN_IDENTITY_TENANT_ID',
		);
		this.tenantEmailVerificationBaseUrl = this.configService.get<string>(
			'TENANT_EMAIL_VERIFICATION_BASE_URL',
		);
		this.tenantEmailAuthContinueUrl = this.configService.get<string>(
			'TENANT_CONTINUE_URL_PATH',
		);
	}

	get auth(): auth.Auth {
		return this.firebaseAdminApp.auth();
	}
	/**
	 *
	 * FUTURE: MULTITENANT LOGIC
	 */
	// get adminAuth(): auth.TenantAwareAuth {
	// 	const tAuth = this.firebaseAdminApp
	// 		.auth()
	// 		.tenantManager()
	// 		.authForTenant(this.adminIdentityTenantId);
	// 	return tAuth;
	// }

	async signOut(): Promise<void> {
		this.currentUser = this.cls.get('currentUser');
		if (this.currentUser) {
			this.cacheManager.del(
				`${this.cacheKeyPrefix}:user:${this.currentUser.kUid}`,
			);
			await this.auth.revokeRefreshTokens(this.currentUser.uid);
			this.cls.set('currentUser', null);
		}
	}

	async verifyAppCheckToken(appCheckToken: string): Promise<any> {
		return await getAppCheck().verifyToken(appCheckToken);
	}
	async getAppCheckToken(): Promise<any> {
		const appId = this.configService.get('FIREBASE_APP_ID');
		const appCheckToken = await getAppCheck().createToken(appId, {
			ttlMillis: 1800000,
		});
		return { token: appCheckToken.token, appId: appId };
	}

	async updateUserPreferences(preferences: any): Promise<any> {
		const currentUser = this.cls.get<ActiveUserData>('currentUser');
		if (!currentUser) {
			throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
		}

		const updatedUserPreferences =
			await this.userPreferencesService.updateUserPreferences(
				currentUser.kUid,
				preferences,
			);
		if (updatedUserPreferences) {
			const cacheKey = `${this.cacheKeyPrefix}:user:${currentUser.kUid}`;
			await this.cacheManager.del(cacheKey);
		}
		return updatedUserPreferences;
	}
	async verifyToken(): Promise<any> {
		const token = this.cls.get('jwtToken');
		return this.auth.verifyIdToken(token);
	}
	async enableTOTPMFA() {
		try {
			auth
				.getAuth()
				.projectConfigManager()
				.updateProjectConfig({
					multiFactorConfig: {
						providerConfigs: [
							{
								state: 'ENABLED',
								totpProviderConfig: {
									adjacentIntervals: 5,
								},
							},
						],
						state: 'ENABLED',
					},
				});
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	async setCustomClaims(uid: string, claims: any) {
		try {
			await this.auth.setCustomUserClaims(uid, claims);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	// async setAdminClaims(uuid: string, claims: any) {
	// 	try {
	// 		await this.adminAuth.setCustomUserClaims(uuid, claims);
	// 	} catch (err) {
	// 		const firebaseErrorMessage =
	// 			this.errorMessageHelper.parseFirebaseError(err);
	// 		throw new FirebaseException(
	// 			firebaseErrorMessage ? firebaseErrorMessage : err.message,
	// 		);
	// 	}
	// }
	async createUser(newUser: {
		email: string;
		password: string;
		displayName: string;
	}): Promise<any> {
		try {
			return await this.auth.createUser({
				email: newUser.email,
				emailVerified: false,
				password: newUser.password,
				displayName: newUser.displayName,
			});
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			this.logger.error(
				`Firebase Error creating user: ${newUser.email} - ${firebaseErrorMessage}`,
			);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	// GETS FIREBASE USER
	async getUser(uid: string) {
		try {
			return await this.auth.getUser(uid);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	// UPDATES FIREBASE USER
	async updateUser(
		uid: string,
		updateData: { email?: string; password?: string },
	): Promise<void> {
		try {
			const user = await this.auth.getUser(uid);
			if (!user) {
				throw new NotFoundException('User not found');
			}

			if (updateData.email) {
				await this.auth.updateUser(uid, {
					email: updateData.email,
				});
			}

			if (updateData.password) {
				await this.auth.updateUser(uid, {
					password: updateData.password,
				});
			}
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	// RESET FIREBASE USER PASSWORD
	async resetPassword(resetPassword: ResetPasswordDto) {
		try {
			const body = {
				oobCode: resetPassword.oobCode,
				newPassword: resetPassword.password,
				email: resetPassword.email,
			};
			const { data } = await firstValueFrom(
				this.httpService
					.post(
						`${this.configService.get('GOOGLE_IDENTITY_ENDPOINT')}:resetPassword?key=${this.configService.get('FIREBASE_API_KEY')}`,
						body,
					)
					.pipe(
						catchError((error: AxiosError) => {
							this.logger.error(
								'Error resetting password:',
								error.response.data,
							);
							throw new FirebaseException('Error resetting password');
						}),
					),
			);
			return data;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	private async validateInvitation(invitationToken: string) {
		const invitationTimeStamp = DateTime.fromJSDate(
			this.suid.parseStamp(invitationToken),
		);
		const end = DateTime.utc();
		return (
			invitationTimeStamp && end.diff(invitationTimeStamp, 'hours').hours < 72
		);
	}
	// ACCEPTS INVITATION
	async acceptInvitation(
		resetPassword: ResetPasswordDto,
		invitationToken: string,
	) {
		try {
			if (!(await this.validateInvitation(invitationToken))) {
				throw new BadRequestException('Invitation link has expired');
			}
			const body = {
				oobCode: resetPassword.oobCode,
				password: resetPassword.password,
				email: resetPassword.email,
				emailVerified: true,
			};
			const { data } = await firstValueFrom(
				this.httpService
					.post(
						`${this.configService.get('GOOGLE_IDENTITY_ENDPOINT')}:update?key=${this.configService.get('FIREBASE_API_KEY')}`,
						body,
					)
					.pipe(
						catchError((error: AxiosError) => {
							this.logger.error(
								'Error resetting password:',
								error.response.data,
							);
							throw new FirebaseException('Error resetting password');
						}),
					),
			);
			if (!data.localId || data['localId'] === undefined) {
				throw new FirebaseException('User not found');
			}
			this.userProfilesRepository.acceptInvitation(data.localId);
			return data;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	async deleteUser(uid: string): Promise<void> {
		try {
			await this.auth.deleteUser(uid);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	async getUserVerificationStatus(uid: string): Promise<boolean> {
		try {
			const user = await this.auth.getUser(uid);
			if (!user) {
				throw new Error('User not found');
			}
			return user.emailVerified;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	async exchangeRefreshToken(refresh_token: string): Promise<any> {
		try {
			const body = { grant_type: 'refresh_token', refresh_token };
			const { data } = await firstValueFrom(
				this.httpService
					.post<TokenResponseDto>(
						`https://securetoken.googleapis.com/v1/token?key=${this.configService.get('FIREBASE_API_KEY')}`,
						body,
					)
					.pipe(
						catchError((error: AxiosError) => {
							this.logger.error(
								'Error exchanging refresh token:',
								error.response.data,
							);
							throw new FirebaseException('Error exchanging refresh token');
						}),
					),
			);
			return data;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	async verifyEmail(oobCode: string): Promise<any> {
		try {
			const body = { oobCode };
			const { data } = await firstValueFrom(
				this.httpService
					.post(
						`${this.configService.get('GOOGLE_IDENTITY_ENDPOINT')}:update?key=${this.configService.get('FIREBASE_API_KEY')}`,
						body,
					)
					.pipe(
						catchError((error: AxiosError) => {
							this.logger.error('Error verifying email:', error.response.data);
							throw new FirebaseException('Error verifying email');
						}),
					),
			);
			return await this.auth.createCustomToken(data.localId);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	async checkUserExist(email: string): Promise<boolean> {
		try {
			return await this.userProfilesRepository.checkUserExist(email);
		} catch (err) {
			throw err;
		}
	}

	async getUserRolesFromToken(token: string): Promise<RolesAndEntitlements> {
		try {
			const decodedToken = await this.auth.verifyIdToken(token);
			const userRoles: UserRoles[] = [];
			if (!!decodedToken.systemRole) {
				userRoles.push(decodedToken.systemRole);
			}
			if (!!decodedToken.organizationRole) {
				userRoles.push(decodedToken.organizationRole);
			}
			const roleAndEntitlements: RolesAndEntitlements = {
				roles: userRoles,
				entitlements: decodedToken.entitlements,
			};
			return roleAndEntitlements;
		} catch (error) {
			return null;
		}
	}

	async getOrgUserInfo(): Promise<any> {
		try {
			this.currentUser = this.cls.get('currentUser');
			if (!this.currentUser.uid && !this.currentUser.kUid) {
				throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
			}
			const cacheKey = `${this.cacheKeyPrefix}:user:${this.currentUser.kUid}`;

			const cachedUser =
				await this.cacheManager.get<LandlordUserDetailsResponseDto>(cacheKey);
			if (cachedUser) {
				return cachedUser;
			} else {
				return await this.getUserDetails(this.currentUser, cacheKey);
			}
		} catch (err) {
			throw err;
		}
	}

	private async getUserDetails(
		currentUser: ActiveUserData,
		cacheKey: string = `${this.cacheKeyPrefix}/user/${currentUser.kUid}`,
	): Promise<LandlordUserDetailsResponseDto> {
		const userDetails = await this.userProfilesRepository.getLandLordUserInfo(
			currentUser.kUid,
			currentUser.uid,
		);
		if (!userDetails) {
			throw new NotFoundException('User not found');
		}
		const notificationsSubscription =
			await this.notificationSubService.getAUserSubscriptionDetails(
				currentUser.kUid,
			);
		const userData = await this.mapLandlordUserToDto(userDetails, currentUser);
		userData.notificationSubscription = notificationsSubscription;
		await this.cacheManager.set(cacheKey, userData, 3600);
		return userData;
	}

	private async mapLandlordUserToDto(
		user: any,
		currentUser: ActiveUserData,
	): Promise<LandlordUserDetailsResponseDto> {
		return plainToInstance(LandlordUserDetailsResponseDto, {
			email: user.email,
			firstName: user.profile_first_name,
			id: user.id,
			profileUuid: user.profile_uuid,
			firebaseId: user.firebase_id,
			isAccountVerified: user.is_account_verified,
			isPrivacyPolicyAgreed: user.is_privacy_policy_agreed,
			isTermsAndConditionAccepted: user.is_terms_and_condition_accepted,
			lastName: user.profile_last_name,
			organization: user.organization,
			organizationUuid: user.org_uuid,
			tenantId: user.tenant_id,
			phone: user.phone,
			preferences: user.user_preferences,
			profilePicUrl: user.profile_pic_url,
			roleName:
				ROLE_ALIAS()[currentUser.organizationRole] ||
				currentUser.organizationRole,
			uuid: user.uuid,
			// orgSettings,
			// orgSubscription,
		});
	}

	async createInvitedUser(invitedUserDto: InviteUserDto): Promise<any> {
		try {
			return await this.auth.createUser({
				email: invitedUserDto.email,
				displayName: `${invitedUserDto.firstName} ${invitedUserDto.lastName}`,
			});
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			this.logger.error(
				`Firebase Error creating user: ${invitedUserDto.email} - ${firebaseErrorMessage}`,
			);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	async createTenant(createUserDto: TenantSignUpDto): Promise<UserProfile> {
		this.currentUser = this.cls.get('currentUser');

		const { email, firstName, lastName } = createUserDto;
		const displayName = `${firstName} ${lastName}`;
		let firebaseUserId: string | null = null;

		const existingUser = await this.userProfilesRepository.findOne({
			where: { email },
		});
		if (existingUser) {
			throw new FirebaseException('A user with this email already exists.');
		}

		try {
			const fireUser = await this.createUser({
				email,
				password: generateString(),
				displayName,
			});
			if (!fireUser) {
				throw new FirebaseException(ErrorMessages.USER_NOT_CREATED);
			}

			firebaseUserId = fireUser.uid;

			const userProfile = await this.createTenantPersona(
				fireUser,
				createUserDto,
				this.currentUser.organizationId,
			);
			if (!userProfile) {
				throw new FirebaseException(ErrorMessages.USER_NOT_CREATED);
			}
			//await this.sendVerificationEmail(email, firstName, lastName);
			return userProfile;
		} catch (error) {
			if (firebaseUserId) {
				await this.deleteUser(firebaseUserId);
			}
			throw new FirebaseException(error);
		}
	}

	async getInvitationToken(invitedUserDto: InviteUserDto): Promise<string> {
		const secret = this.configService.get<string>('KLUBIQ_ADMIN_API_KEY');
		return createHmac('sha256', secret)
			.update(
				`${invitedUserDto.email}|${invitedUserDto.firstName}||${invitedUserDto.lastName}`,
			)
			.digest('hex');
	}
	async ensureAuthorizedFirebaseRequest(
		url: string,
		method: string,
		body: any,
	) {
		const { token, appId } = await this.getAppCheckToken();
		if (!token && !appId) {
			throw new UnauthorizedException('No app check token found');
		}
		const headers = {
			'x-firebase-gmpid': appId,
			'x-firebase-appcheck': token,
		};
		return this.httpService.request<any>({
			url,
			method,
			data: body,
			headers,
		});
	}

	async signInWithEmailPassword(
		email: string,
		password: string,
	): Promise<SignInByFireBaseResponseDto> {
		try {
			const url = `${this.configService.get<string>('GOOGLE_IDENTITY_ENDPOINT')}:signInWithPassword?key=${this.configService.get<string>('FIREBASE_API_KEY')}`;
			const payload = {
				email,
				password,
				returnSecureToken: true,
			};
			const response = await this.ensureAuthorizedFirebaseRequest(
				url,
				'POST',
				payload,
			);
			const { data } = await firstValueFrom(
				response.pipe(
					catchError((error: AxiosError | any) => {
						const firebaseError = error.response.data;
						this.logger.error('Firebase sign-in error:', firebaseError);
						throw new FirebaseException(firebaseError);
					}),
				),
			);
			return data;
		} catch (err) {
			const message =
				err instanceof FirebaseException
					? err.message
					: this.errorMessageHelper.parseFirebaseError(err) ||
						'Unknown error during sign-in';
			throw new FirebaseException(message);
		}
	}

	async signInAndGetAccessToken(email: string, password: string): Promise<any> {
		try {
			const signInData = await this.signInWithEmailPassword(email, password);
			const refreshToken = signInData.refreshToken;

			if (!refreshToken) {
				throw new FirebaseException(
					'No refresh token returned from Firebase sign-in',
				);
			}

			const tokenData = await this.exchangeRefreshToken(refreshToken);

			if (!tokenData.access_token) {
				throw new FirebaseException(
					'No access token returned from refresh token exchange',
				);
			}

			return {
				...signInData,
				access_token: tokenData.access_token,
			};
		} catch (error) {
			this.logger.error(
				'Error during Firebase sign-in and access token retrieval',
				error,
			);
			const message =
				error instanceof FirebaseException
					? error.message
					: 'Unexpected error during token exchange';
			throw new FirebaseException(message);
		}
	}

	private async createLeaseForTenantOnboarding(
		leaseDto: OnboardingLeaseDto,
		organizationUuid: string,
		transactionalEntityManager?: EntityManager,
	): Promise<Lease> {
		const { unitId, startDate, ...leaseData } = leaseDto;
		const newLeaseStartDate = DateTime.fromISO(startDate).toSQL({
			includeOffset: false,
		});
		const activeStatuses = [`${LeaseStatus.ACTIVE}`, `${LeaseStatus.EXPIRING}`];
		const leaseName = this.generators.generateLeaseName(
			leaseDto.propertyName,
			leaseDto.unitNumber,
		);
		const status =
			DateTime.fromISO(leaseDto.startDate).toJSDate().getDate() >
			DateTime.utc().toJSDate().getDate()
				? LeaseStatus.INACTIVE
				: LeaseStatus.ACTIVE;

		return await transactionalEntityManager.transaction(async () => {
			// Create lease within transaction
			const overlappingLease = await transactionalEntityManager
				.createQueryBuilder(Lease, 'lease')
				.where('lease."unitId" = :unitId', { unitId })
				.andWhere(
					':newLeaseStartDate BETWEEN lease."startDate" AND lease."endDate"',
					{ newLeaseStartDate },
				)
				.andWhere('lease.status IN (:...statuses)', {
					statuses: activeStatuses,
				})
				.getOne();
			if (overlappingLease) {
				throw new BadRequestException(
					'The unit already has an active lease during the specified period.',
				);
			}
			const unit = await transactionalEntityManager.findOneBy(Unit, {
				id: unitId,
			});
			if (!unit) {
				throw new BadRequestException('Invalid unit ID.');
			}

			const lease = transactionalEntityManager.create(Lease, {
				startDate: newLeaseStartDate,
				endDate: DateTime.fromISO(leaseData.endDate).toSQL({
					includeOffset: false,
				}),
				unit,
				organizationUuid,
				status,
				name: leaseName,
				...leaseData,
			});
			return await transactionalEntityManager.save(lease);
		});
	}
	private async createTenantUserWithProfile(
		transactionalEntityManager: EntityManager,
		fireUser: any,
		createUserDto: TenantSignUpDto,
	): Promise<{ tenantUser: TenantUser; userProfile: UserProfile }> {
		const tenantUser = transactionalEntityManager.create(TenantUser, {
			isActive: true,
			role: createUserDto.role,
		});

		await transactionalEntityManager.save(tenantUser);
		const userProfile = transactionalEntityManager.create(UserProfile, {
			email: createUserDto.email,
			firebaseId: fireUser.uid,
			firstName: createUserDto.firstName,
			lastName: createUserDto.lastName,
			phoneNumber: createUserDto.phoneNumber,
			isPrivacyPolicyAgreed: true,
			isTermsAndConditionAccepted: true,
			tenantUser,
		});

		const savedUserProfile = await transactionalEntityManager.save(userProfile);

		await this.setCustomClaims(savedUserProfile.firebaseId, {
			kUid: savedUserProfile.profileUuid,
			organizationRole: createUserDto.role.name,
		});

		return { tenantUser, userProfile: savedUserProfile };
	}

	private async createTenantPersona(
		fireUser: any,
		createUserDto: TenantSignUpDto,
		organizationUuid: string,
	): Promise<UserProfile> {
		const entityManager = this.tenantRepository.manager;

		return entityManager.transaction(async (transactionalEntityManager) => {
			const { tenantUser, userProfile } =
				await this.createTenantUserWithProfile(
					transactionalEntityManager,
					fireUser,
					createUserDto,
				);

			if (userProfile && createUserDto.leaseDetails) {
				try {
					const lease = await this.createLeaseForTenantOnboarding(
						createUserDto.leaseDetails,
						organizationUuid,
						transactionalEntityManager,
						// pass it to be reused
					);
					if (lease && tenantUser) {
						const leaseTenant = new LeasesTenants();
						leaseTenant.tenant = tenantUser;
						leaseTenant.lease = lease;
						leaseTenant.isPrimaryTenant = true;
						await transactionalEntityManager.save(leaseTenant);

						const invitation = new TenantInvitation();
						invitation.userId = userProfile.profileUuid;
						invitation.firebaseUid = fireUser.uid;
						invitation.invitedAt = this.timestamp;
						invitation.token = await this.getInvitationToken(createUserDto);
						await transactionalEntityManager.save(invitation);
						await this.sendTenantInvitationEmail(createUserDto, invitation);
					}
					/// INVITATION DATA
				} catch (error) {
					console.error('Error creating lease for tenant:', error);
					throw new Error(
						`Failed to create lease for tenant. ${error.message}`,
					);
				}
			}

			return userProfile;
		});
	}

	// THIS IS TO SEND INVITATION EMAIL TO A USER ADDED TO AN ORGANIZATION
	async sendTenantInvitationEmail(
		invitedUserDto: TenantSignUpDto,
		invitation: TenantInvitation,
	): Promise<void> {
		try {
			const currentUser = this.cls.get<ActiveUserData>('currentUser');
			let resetPasswordLink = await this.auth.generatePasswordResetLink(
				invitedUserDto.email,
				this.getActionCodeSettings(
					this.tenantEmailVerificationBaseUrl,
					this.tenantEmailAuthContinueUrl,
				),
			);
			resetPasswordLink += `&email=${invitedUserDto.email}&type=tenant-invitation&token=${invitation.token}`;
			const actionUrl = replace(resetPasswordLink, '_auth_', 'reset-password');
			const emailTemplate = EmailTemplates['tenant-invite'];
			await this.emailService.sendTransactionalEmail(
				{
					email: invitedUserDto.email,
					firstName: invitedUserDto.firstName,
					lastName: invitedUserDto.lastName,
				},
				actionUrl,
				emailTemplate,
				{
					username: `${invitedUserDto.firstName} ${invitedUserDto.lastName}`,
					property_details: `${invitedUserDto.leaseDetails.propertyName} ${invitedUserDto.leaseDetails.unitNumber ? `Unit ${invitedUserDto.leaseDetails.unitNumber}` : ''}`,
					property_manager: currentUser.name,
					expires_after: '72hrs',
				},
			);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}
	abstract getActionCodeSettings(baseUrl: string, continueUrl: string): any;

	abstract generatePasswordResetEmail(email: string): void;

	abstract sendVerificationEmail(
		email: string,
		firstName: string,
		lastName: string,
	): void;

	abstract inviteUser(invitedUserDto: InviteUserDto): any;

	abstract sendInvitationEmail(
		invitedUserDto: InviteUserDto,
		invitation: UserInvitation,
	): any;
}
