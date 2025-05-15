import {
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
	Inject,
	BadRequestException,
	ConflictException,
	ServiceUnavailableException,
	ForbiddenException,
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
	TenantUserDetailsResponseDto,
	MFAResponseDto,
	VerifyMfaOtpResponseDto,
} from '../dto/responses/auth-response.dto';
import {
	CacheKeys,
	LeaseStatus,
	ROLE_ALIAS,
	UserRoles,
	UserType,
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
import { replace, split } from 'lodash';
import { EmailTemplates } from '@app/common/email/types/email.types';
import { MailerSendService } from '@app/common/email/email.service';
import { OnboardingLeaseDto } from 'apps/klubiq-dashboard/src/lease/dto/requests/create-lease.dto';
import { Lease } from '@app/common/database/entities/lease.entity';
import { Unit } from '@app/common/database/entities/unit.entity';
import { LeasesTenants } from '@app/common/database/entities/leases-tenants.entity';
import { Generators } from '@app/common/helpers/generators';
import { ApiDebugger } from '@app/common/helpers/debug-loggers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from '@app/common/event-listeners/event-models/event-constants';
import { OrganizationTenants } from '@app/common/database/entities/organization-tenants.entity';
import { CreateTenantDto } from '@app/common/dto/requests/create-tenant.dto';
import { extractAccessToken } from '../helpers/cookie-helper';
import { Request } from 'express';
import { AccessControlService } from './access-control.service';
import { Util } from '@app/common/helpers/util';
@Injectable()
export abstract class AuthService {
	protected abstract readonly logger: Logger;
	private readonly adminIdentityTenantId: string;
	private readonly cacheKeyPrefix = 'auth';
	private readonly cacheTTL = 900000;
	protected readonly cacheService = new CacheService(this.cacheManager);
	protected readonly suid = new ShortUniqueId();
	protected readonly timestamp = DateTime.utc().toSQL({ includeOffset: false });
	private currentUser: ActiveUserData;
	protected readonly tenantEmailVerificationBaseUrl: string;
	protected readonly tenantEmailAuthContinueUrl: string;
	private readonly landlordPortalClientId: string;
	private readonly tenantPortalClientId: string;
	private readonly adminPortalClientId: string;
	private readonly emailVerificationBaseUrl: string;
	private readonly emailAuthContinueUrl: string;

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
		protected readonly apiDebugger: ApiDebugger,
		protected readonly eventEmitter: EventEmitter2,
		protected readonly accessControlService: AccessControlService,
		protected readonly util: Util,
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
		this.landlordPortalClientId = this.configService.get<string>(
			'LANDLORP_PORTAL_CLIENT_ID',
		);
		this.tenantPortalClientId = this.configService.get<string>(
			'TENANT_PORTAL_CLIENT_ID',
		);
		this.adminPortalClientId = this.configService.get<string>(
			'ADMIN_PORTAL_CLIENT_ID',
		);
		this.emailVerificationBaseUrl = this.configService.get<string>(
			'EMAIL_VERIFICATION_BASE_URL',
		);
		this.emailAuthContinueUrl =
			this.configService.get<string>('CONTINUE_URL_PATH');
	}

	private getcacheKey(cacheKeyExtension?: string) {
		return `${CacheKeys.AUTH}${cacheKeyExtension ? `:${cacheKeyExtension}` : ''}`;
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
			const cacheKey = this.getcacheKey(`user:${this.currentUser.kUid}`);
			await this.accessControlService.invalidateCache(
				this.currentUser.kUid,
				this.currentUser.organizationId,
			);
			await this.accessControlService.invalidateAllCache([cacheKey]);
			await this.auth.revokeRefreshTokens(this.currentUser.uid);
			this.cls.set('currentUser', null);
		}
	}

	async verifyAppCheckToken(appCheckToken: string): Promise<any> {
		this.apiDebugger.info('Verifying app check token', appCheckToken);
		return await getAppCheck().verifyToken(appCheckToken);
	}
	async getAppCheckToken(): Promise<any> {
		const appId = this.configService.get('FIREBASE_APP_ID');
		const appCheckToken = await getAppCheck().createToken(appId, {
			ttlMillis: 1800000,
		});
		this.apiDebugger.info('App check token Details', appId, appCheckToken);
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
			const cacheKey = this.getcacheKey(`user:${currentUser.kUid}`);
			await this.cacheManager.del(cacheKey);
		}
		return updatedUserPreferences;
	}
	async verifyToken(request: Request): Promise<any> {
		const token =
			extractAccessToken(request) ?? this.cls.get('jwtToken') ?? null;
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

	async acceptLandlordInvitation(
		resetPassword: ResetPasswordDto,
		invitationToken: string,
	) {
		try {
			if (!(await this.validateInvitation(invitationToken))) {
				throw new BadRequestException('Invitation link has expired');
			}
			const userData = await this.acceptInvitation(resetPassword);
			this.userProfilesRepository.acceptInvitation(
				userData.localId,
				UserType.LANDLORD,
			);
			return userData;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	async acceptTenantInvitation(
		resetPassword: ResetPasswordDto,
		invitationToken: string,
	) {
		try {
			if (!(await this.validateInvitation(invitationToken))) {
				throw new BadRequestException('Invitation link has expired');
			}
			const userData = await this.acceptInvitation(resetPassword);
			this.userProfilesRepository.acceptInvitation(
				userData.localId,
				UserType.TENANT,
			);
			return userData;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	async acceptInvitation(resetPassword: ResetPasswordDto) {
		try {
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
			const cacheKey = this.getcacheKey(`user:${this.currentUser.kUid}`);

			const cachedUser =
				await this.cacheManager.get<LandlordUserDetailsResponseDto>(cacheKey);
			if (cachedUser) {
				return cachedUser;
			} else {
				return await this.getLoginUserDetails(
					this.currentUser.email,
					this.currentUser.uid,
					'landlord',
				);
			}
		} catch (err) {
			throw err;
		}
	}

	async getTenantUserInfo(): Promise<any> {
		try {
			this.currentUser = this.cls.get('currentUser');
			if (!this.currentUser.uid && !this.currentUser.kUid) {
				throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
			}
			const cacheKey = this.getcacheKey(`user:${this.currentUser.kUid}`);

			const cachedUser =
				await this.cacheManager.get<TenantUserDetailsResponseDto>(cacheKey);
			if (cachedUser) {
				return cachedUser;
			} else {
				return await this.getLoginUserDetails(
					this.currentUser.email,
					this.currentUser.uid,
					'tenant',
				);
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
		await this.cacheManager.set(cacheKey, userData, this.cacheTTL);
		return userData;
	}

	private async getLoginUserDetails(
		email: string,
		firebaseId: string,
		type: 'landlord' | 'tenant' | 'staff',
	): Promise<LandlordUserDetailsResponseDto> {
		let userDetails: any;
		let notificationsSubscription: any;
		let cacheKey = `${this.cacheKeyPrefix}:user:`;
		switch (type) {
			case 'landlord':
				userDetails =
					await this.userProfilesRepository.getLandLordUserInfoByEmailAndFirebaseId(
						email,
						firebaseId,
					);
				notificationsSubscription = userDetails?.profile_uuid
					? await this.notificationSubService.getAUserSubscriptionDetails(
							userDetails.profile_uuid,
						)
					: null;
				userDetails = (await this.mapLandlordUserToDto(userDetails)) || {};
				cacheKey = `${cacheKey}${userDetails.uuid}`;
				break;
			case 'tenant':
				userDetails =
					await this.userProfilesRepository.getTenantUserInfoByEmailAndFirebaseId(
						email,
						firebaseId,
					);
				notificationsSubscription = userDetails?.profileUuid
					? await this.notificationSubService.getAUserSubscriptionDetails(
							userDetails.profileUuid,
						)
					: null;
				userDetails = (await this.mapTenantUserToDto(userDetails)) || {};
				cacheKey = `${cacheKey}${userDetails.uuid}`;
				break;
			default:
				userDetails = {};
		}
		if (!userDetails) {
			throw new NotFoundException('User not found');
		}
		userDetails.notificationSubscription = notificationsSubscription;
		await this.cacheManager.set(cacheKey, userDetails, this.cacheTTL);
		return userDetails;
	}

	private async mapLandlordUserToDto(
		user: any,
		currentUser: ActiveUserData = null,
	): Promise<LandlordUserDetailsResponseDto> {
		if (!user) {
			return null;
		}
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
				ROLE_ALIAS()[currentUser?.organizationRole || user.org_role] ||
				currentUser?.organizationRole ||
				user.org_role,
			uuid: user.uuid,
			// orgSettings,
			// orgSubscription,
		});
	}

	private async mapTenantUserToDto(
		user: any,
	): Promise<TenantUserDetailsResponseDto> {
		if (!user) {
			return null;
		}
		return plainToInstance(TenantUserDetailsResponseDto, {
			...user,
			preferences: user?.userPreferences || {},
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

	// Creates a new tenant account without a lease
	// A tenant is created and then we send an invitation email to activate their account
	async createTenant(createUserDto: CreateTenantDto): Promise<UserProfile> {
		this.apiDebugger.info('Creating tenant', createUserDto);
		this.currentUser = this.cls.get('currentUser');

		const { email, firstName, lastName } = createUserDto;
		const displayName = `${firstName} ${lastName}`;
		let firebaseUserId: string | null = null;

		// check if the user has a login account and is a tenant
		const existingUser =
			await this.userProfilesRepository.checkTenantUserExist(email);
		if (existingUser) {
			throw new ConflictException(
				'This email is already in use by another tenant. Please use a different email.',
			);
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
				throw new ServiceUnavailableException(
					`${ErrorMessages.USER_NOT_CREATED} due to an unknown error`,
				);
			}
			this.emitEvent(
				EVENTS.TENANT_CREATED,
				this.currentUser.organizationId,
				false,
			);
			return userProfile;
		} catch (error) {
			this.apiDebugger.error('Error creating tenant', error);
			if (firebaseUserId) {
				await this.deleteUser(firebaseUserId);
			}
			throw error;
		}
	}

	// Onboards a new tenant account for a lease
	// A tenant is created and then a lease is created for them
	async onboardTenant(createUserDto: TenantSignUpDto): Promise<UserProfile> {
		this.apiDebugger.info('Onboarding tenant', createUserDto);
		this.currentUser = this.cls.get('currentUser');

		const { email, firstName, lastName } = createUserDto;
		const displayName = `${firstName} ${lastName}`;
		let firebaseUserId: string | null = null;

		// check if the user has a login account and is a tenant
		const existingUser =
			await this.userProfilesRepository.checkTenantUserExist(email);
		if (existingUser) {
			throw new ConflictException(
				'This email is already in use by another tenant. Please use a different email.',
			);
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
				throw new ServiceUnavailableException(
					`${ErrorMessages.USER_NOT_CREATED} due to an unknown error`,
				);
			}
			this.emitEvent(
				EVENTS.TENANT_ONBOARDED,
				this.currentUser.organizationId,
				false,
			);
			return userProfile;
		} catch (error) {
			this.apiDebugger.error('Error creating tenant', error);
			if (firebaseUserId) {
				await this.deleteUser(firebaseUserId);
			}
			throw error;
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
		const data = this.httpService.request<any>({
			url,
			method,
			data: body,
			headers,
		});
		console.log({ data });

		return data;
	}

	async firebaseLookupUser(token: string): Promise<any> {
		const url = `${this.configService.get<string>('GOOGLE_IDENTITY_ENDPOINT')}:lookup?key=${this.configService.get<string>('FIREBASE_API_KEY')}`;
		const payload = {
			idToken: token,
		};
		const response = await this.ensureAuthorizedFirebaseRequest(
			url,
			'POST',
			payload,
		);
		return await firstValueFrom(
			response.pipe(
				catchError((error: AxiosError | any) => {
					this.apiDebugger.error('User lookup error', error);
					throw new FirebaseException(error);
				}),
			),
		);
	}

	private getV2GoogleEndpoint(url: string): string {
		return replace(url, 'v1', 'v2');
	}

	/**
	 * Calls the google identity endpoint to sign in with email and password
	 * @param email
	 * @param password
	 * @param asLandlord
	 * @returns
	 */
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
						this.apiDebugger.error(
							'Error signing in with email password',
							error,
						);
						const firebaseError = error.response.data;
						this.logger.error('Firebase sign-in error:', firebaseError);
						throw new FirebaseException(firebaseError);
					}),
				),
			);
			return data;
		} catch (err) {
			this.apiDebugger.error('Error signing in with email password', err);
			const message =
				err instanceof FirebaseException
					? err.message
					: this.errorMessageHelper.parseFirebaseError(err) ||
						'Unknown error during sign-in';
			throw new FirebaseException(message);
		}
	}

	/**
	 * Calls the google identity endpoint to sign in with email and password
	 * @param email
	 * @param password
	 * @param asLandlord
	 * @returns
	 */
	async verifyMfaOtp(
		mfaPendingCredential: string,
		mfaOtp: string,
		mfaEnrollmentId: string,
	): Promise<VerifyMfaOtpResponseDto> {
		try {
			const baseUrl = this.getV2GoogleEndpoint(
				this.configService.get<string>('GOOGLE_IDENTITY_ENDPOINT'),
			);
			const url = `${baseUrl}/mfaSignIn:finalize?key=${this.configService.get<string>('FIREBASE_API_KEY')}`;
			const payload = {
				mfaPendingCredential,
				mfaEnrollmentId,
				totpVerificationInfo: {
					verificationCode: mfaOtp,
				},
			};
			const response = await this.ensureAuthorizedFirebaseRequest(
				url,
				'POST',
				payload,
			);
			const { data } = await firstValueFrom(
				response.pipe(
					catchError((error: AxiosError | any) => {
						this.apiDebugger.error('Error verifying MFA OTP', error);
						const firebaseError = error.response.data;
						this.logger.error('Firebase sign-in error:', firebaseError);
						throw new FirebaseException(firebaseError);
					}),
				),
			);
			return data;
		} catch (err) {
			this.apiDebugger.error('Error verifying MFA OTP', err);
			const message =
				err instanceof FirebaseException
					? err.message
					: this.errorMessageHelper.parseFirebaseError(err) ||
						'Unknown error during MFA OTP verification';
			throw new FirebaseException(message);
		}
	}

	/**
	 * Signs in with email and password and returns the access token
	 * @param email
	 * @param password
	 * @param asLandlord
	 * @returns
	 */
	async signInAndGetAccessToken(
		emailAddress: string,
		password: string,
	): Promise<any> {
		try {
			const clientId = this.cls.get('clientName');
			if (!clientId) {
				throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
			}
			const authorizedClients = this.configService
				.get<string>('KLUBIQ_API_APPCHECK_CLIENTS')
				.split('|');
			if (!authorizedClients.includes(clientId)) {
				throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
			}
			const signInData = await this.signInWithEmailPassword(
				emailAddress,
				password,
			);
			const { refreshToken, idToken, displayName, registered, expiresIn } =
				signInData;
			if (!refreshToken) {
				const requiresMfa = signInData.mfaInfo?.length > 0;
				//const factors = signInData.mfaInfo?.map((factor) => {return factor.displayName;});
				if (requiresMfa) {
					const response: MFAResponseDto = {
						message: ErrorMessages.MFA_REQUIRED,
						mfaPendingCredential: signInData.mfaPendingCredential,
						mfaEnrollmentId: signInData.mfaInfo[0].mfaEnrollmentId,
					};
					return response;
				}
				throw new FirebaseException(ErrorMessages.TOKEN_NOT_RETURNED);
			}
			const names = split(displayName, ' ');
			if (!registered && clientId === this.landlordPortalClientId) {
				await this.sendVerificationEmail(
					emailAddress,
					names[0] || '',
					names[1] || '',
				);
				throw new ForbiddenException(ErrorMessages.EMAIL_NOT_VERIFIED);
			} else if (!registered && clientId === this.tenantPortalClientId) {
				await this.sendVerificationEmail(
					emailAddress,
					names[0] || '',
					names[1] || '',
					this.tenantEmailVerificationBaseUrl,
					this.tenantEmailAuthContinueUrl,
				);
				throw new ForbiddenException(ErrorMessages.EMAIL_NOT_VERIFIED);
			}

			const tokenData: TokenResponseDto = {
				access_token: idToken,
				expires_in: expiresIn,
				refresh_token: refreshToken,
			};
			return tokenData;
		} catch (error) {
			this.logger.error(
				'Error during Firebase sign-in and access token retrieval',
				error,
			);
			throw error;
		}
	}

	/**
	 * Checks a Firebase user's MFA status and lists enrolled factors.
	 * @param {string} uid - The Firebase user's UID.
	 * @returns {Promise<string[]>}
	 */
	async getUserMfaFactors(uid: string): Promise<string[]> {
		let enrolledFactors: string[] = [];
		try {
			const userRecord = await this.auth.getUser(uid);

			if (
				userRecord.multiFactor &&
				Array.isArray(userRecord.multiFactor.enrolledFactors) &&
				userRecord.multiFactor.enrolledFactors.length > 0
			) {
				this.apiDebugger.info(
					`User ${uid} has the following MFA factors enrolled:`,
				);
				this.apiDebugger.info(
					`User ${uid} has the following MFA factors enrolled:`,
				);
				enrolledFactors = userRecord.multiFactor.enrolledFactors.map(
					(factor) => {
						return factor.factorId;
					},
				);
				// userRecord.multiFactor.enrolledFactors.forEach((factor, idx) => {
				//   this.apiDebugger.info(`  Factor #${idx + 1}:`);
				//   this.apiDebugger.info(`    Factor ID: ${factor.factorId}`); // 'phone' or 'totp'
				//   this.apiDebugger.info(`    UID: ${factor.uid}`);
				//   this.apiDebugger.info(`    Display Name: ${factor.displayName || 'N/A'}`);
				//   this.apiDebugger.info(`    Enrollment Time: ${factor.enrollmentTime}`);
				// });

				// Check specifically for TOTP
			} else {
				this.apiDebugger.info(`User ${uid} has NO MFA factors enrolled.`);
			}
		} catch (error) {
			this.apiDebugger.error('Error fetching user:', error);
		}
		return enrolledFactors;
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

		const status =
			DateTime.fromISO(leaseDto.startDate).toJSDate().getDate() >
			DateTime.utc().toJSDate().getDate()
				? LeaseStatus.INACTIVE
				: LeaseStatus.ACTIVE;

		return await transactionalEntityManager.transaction(async () => {
			// Create lease within transaction
			const name = this.generators.generateLeaseName(
				leaseDto.propertyName,
				leaseDto.unitNumber,
			);
			//console.log('leaseName', name);
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
				throw new ConflictException(
					'The unit already has an active lease during the specified period.',
				);
			}
			const unit = await transactionalEntityManager.findOne(Unit, {
				where: { id: unitId },
				relations: {
					property: true,
				},
			});
			if (!unit) {
				throw new BadRequestException('Invalid unit ID.');
			}
			leaseData.rentAmount = this.generators.parseRentAmount(
				leaseData.rentAmount,
			);

			const lease = transactionalEntityManager.create(Lease, {
				startDate: newLeaseStartDate,
				endDate: DateTime.fromISO(leaseData.endDate).toSQL({
					includeOffset: false,
				}),
				unit,
				organizationUuid,
				status,
				name,
				...leaseData,
			});
			const propertyCacheKey = this.util.getcacheKey(
				organizationUuid,
				CacheKeys.PROPERTY,
				unit.property.uuid,
			);
			await this.cacheManager.del(propertyCacheKey);
			return await transactionalEntityManager.save(lease);
		});
	}
	private async createTenantUserWithProfile(
		transactionalEntityManager: EntityManager,
		fireUser: any,
		createUserDto: TenantSignUpDto | CreateTenantDto,
	): Promise<{ tenantUser: TenantUser; userProfile: UserProfile }> {
		const tenantUser = transactionalEntityManager.create(TenantUser, {
			isActive: true,
			role: createUserDto.role,
			companyName: createUserDto.companyName,
			...('dateOfBirth' in createUserDto
				? { dateOfBirth: createUserDto.dateOfBirth }
				: {}),
			...('notes' in createUserDto ? { notes: createUserDto.notes } : {}),
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
			title: createUserDto.title,
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
		createUserDto: TenantSignUpDto | CreateTenantDto,
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

			if (
				userProfile &&
				'leaseDetails' in createUserDto &&
				createUserDto.leaseDetails
			) {
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
					}
				} catch (error) {
					this.apiDebugger.error('Error creating lease for tenant:', error);
					this.logger.error('Error creating lease for tenant:', error);
					throw error;
				}
			}
			const organizationTenant = new OrganizationTenants();
			organizationTenant.tenant = tenantUser;
			organizationTenant.organizationUuid = organizationUuid;
			await transactionalEntityManager.save(organizationTenant);

			const invitation = new TenantInvitation();
			invitation.userId = userProfile.profileUuid;
			invitation.firebaseUid = fireUser.uid;
			invitation.invitedAt = this.timestamp;
			invitation.token = await this.getInvitationToken(createUserDto);
			await transactionalEntityManager.save(invitation);
			await this.sendTenantInvitationEmail(createUserDto, invitation);

			return userProfile;
		});
	}

	// THIS IS TO SEND INVITATION EMAIL TO A USER ADDED TO AN ORGANIZATION
	async sendTenantInvitationEmail(
		invitedUserDto: TenantSignUpDto | CreateTenantDto,
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
			const recipient = {
				email: invitedUserDto.email,
				firstName:
					'firstName' in invitedUserDto
						? invitedUserDto.firstName
						: 'companyName' in invitedUserDto
							? invitedUserDto.companyName
							: '',
				lastName: 'lastName' in invitedUserDto ? invitedUserDto.lastName : '',
			};

			const customData = {
				username: `${'firstName' in invitedUserDto ? invitedUserDto.firstName : 'companyName' in invitedUserDto ? invitedUserDto.companyName : ''} ${'lastName' in invitedUserDto ? invitedUserDto.lastName : ''}`,
				property_manager: currentUser.name,
				expires_after: '72hrs',
			};
			let emailTemplate = EmailTemplates['tenant-invite'];
			if ('leaseDetails' in invitedUserDto && invitedUserDto.leaseDetails) {
				emailTemplate = EmailTemplates['tenant-onboard'];
				customData['property_details'] =
					`${invitedUserDto.leaseDetails.propertyName} ${invitedUserDto.leaseDetails.unitNumber ? `Unit ${invitedUserDto.leaseDetails.unitNumber}` : ''}`;
			}
			await this.emailService.sendTransactionalEmail(
				recipient,
				actionUrl,
				emailTemplate,
				customData,
			);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(firebaseErrorMessage || err.message);
		}
	}

	private emitEvent(
		event: string,
		organizationId: string = null,
		sendNotification: boolean = true,
	) {
		this.eventEmitter.emitAsync(event, {
			organizationId,
			sendNotification,
		});
	}
	// abstract getActionCodeSettings(baseUrl: string, continueUrl: string): any;

	// abstract generatePasswordResetEmail(email: string): void;

	// abstract sendVerificationEmail(
	// 	email: string,
	// 	firstName: string,
	// 	lastName: string,
	// ): void;

	abstract inviteUser(invitedUserDto: InviteUserDto): any;

	// abstract sendInvitationEmail(
	// 	invitedUserDto: InviteUserDto,
	// 	invitation: UserInvitation,
	// ): any;

	getActionCodeSettings(baseUrl: string, continueUrl: string) {
		return {
			url: `${baseUrl}${continueUrl}`,
		};
	}

	async generatePasswordResetEmail(email: string): Promise<void> {
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
			const errorMessage = firebaseErrorMessage || err.message;

			this.logger.error('Error generating password reset email:', err);

			throw new FirebaseException(errorMessage);
		}
	}

	async sendVerificationEmail(
		email: string,
		firstName: string,
		lastName: string,
		verificationBaseUrl: string = this.emailVerificationBaseUrl,
		verificationContinueUrl: string = this.emailAuthContinueUrl,
	): Promise<void> {
		try {
			const verificationLink = await admin
				.auth()
				.generateEmailVerificationLink(
					email,
					this.getActionCodeSettings(
						verificationBaseUrl,
						verificationContinueUrl,
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

	async sendInvitationEmail(
		invitedUserDto: InviteUserDto,
		invitation: UserInvitation,
	): Promise<void> {
		try {
			let resetPasswordLink = await this.auth.generatePasswordResetLink(
				invitedUserDto.email,
				this.getActionCodeSettings(
					this.emailVerificationBaseUrl,
					this.emailAuthContinueUrl,
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
}
