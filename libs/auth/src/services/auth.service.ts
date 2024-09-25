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
import { FirebaseException } from '../exception/firebase.exception';
import {
	InviteUserDto,
	ResetPasswordDto,
	//UpdateFirebaseUserDto,
} from '../dto/requests/user-login.dto';
import {
	AuthUserResponseDto,
	LandlordUserDetailsResponseDto,
	TokenResponseDto,
} from '../dto/responses/auth-response.dto';
import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import { UserRoles } from '@app/common/config/config.constants';
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
import { map } from 'lodash';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from '@app/common/services/cache.service';
import ShortUniqueId from 'short-unique-id';
import { DateTime } from 'luxon';
@Injectable()
export abstract class AuthService {
	protected abstract readonly logger: Logger;
	private readonly adminIdentityTenantId: string;
	private readonly cacheKeyPrefix = 'auth';
	private readonly cacheTTL = 90;
	protected readonly cacheService = new CacheService(this.cacheManager);
	protected readonly suid = new ShortUniqueId();
	constructor(
		@Inject('FIREBASE_ADMIN') protected firebaseAdminApp: admin.app.App,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) protected cacheManager: Cache,
		private readonly userProfilesRepository: UserProfilesRepository,
		protected readonly errorMessageHelper: FirebaseErrorMessageHelper,
		protected readonly configService: ConfigService,
		private readonly httpService: HttpService,
		protected readonly cls: ClsService<SharedClsStore>,
	) {
		this.adminIdentityTenantId = this.configService.get<string>(
			'ADMIN_IDENTITY_TENANT_ID',
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
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	async setCustomClaims(uuid: string, claims: any) {
		try {
			await this.auth.setCustomUserClaims(uuid, claims);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
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
			const userRecord = await this.auth.createUser({
				email: newUser.email,
				emailVerified: false,
				password: newUser.password,
				displayName: newUser.displayName,
			});
			return userRecord;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			this.logger.error(
				`Firebase Error creating user: ${newUser.email} - ${firebaseErrorMessage}`,
			);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	// GETS FIREBASE USER
	async getUser(uid: string) {
		try {
			const userRecord = await this.auth.getUser(uid);
			return userRecord;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
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
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
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
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
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
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	async deleteUser(uid: string): Promise<void> {
		try {
			await this.auth.deleteUser(uid);
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
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
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
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
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
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
			const jwtToken = await this.auth.createCustomToken(data.localId);
			return jwtToken;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	async checkUserExist(email: string): Promise<boolean> {
		try {
			return await this.userProfilesRepository.checkUerExist(email);
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

	async getUserInfo(): Promise<any> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser.uid) {
				throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
			}
			switch (currentUser.systemRole) {
				case UserRoles.LANDLORD:
					return await this.getLandlordUser(currentUser.uid);
				case UserRoles.ADMIN:
					break;
			}
			const user = await this.userProfilesRepository.getUserLoginInfo(
				currentUser.uid,
			);
			const userData = this.mapper.map(user, UserProfile, AuthUserResponseDto);
			return userData;
		} catch (err) {
			console.log(err.message);
			throw err;
		}
	}

	private async getLandlordUser(
		userId: string,
	): Promise<LandlordUserDetailsResponseDto> {
		const cacheKey = `${this.cacheKeyPrefix}-landlord/user/${userId}`;
		const cachedUser =
			await this.cacheManager.get<LandlordUserDetailsResponseDto>(cacheKey);
		if (cachedUser) return cachedUser;
		const user = await this.userProfilesRepository.getLandLordUserInfo(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		const userData = await this.mapLandlordUserToDto(
			user,
			this.cls.get('currentUser'),
		);
		await this.cacheManager.set(cacheKey, userData, 3600);
		return userData;
	}

	private async mapLandlordUserToDto(
		user: any,
		currentUser: ActiveUserData,
	): Promise<LandlordUserDetailsResponseDto> {
		const entitlementsResolve = (data: string[]): Record<string, string> => {
			const resolved = map(data, (item) => {
				const entitlements = item.split(':');
				return {
					[entitlements[0]]: entitlements[1],
				};
			});
			return resolved ? Object.assign({}, ...resolved) : {};
		};
		return plainToInstance(LandlordUserDetailsResponseDto, {
			email: user.email,
			entitlements: entitlementsResolve(currentUser.entitlements),
			firstName: user.first_name
				? user.first_name
				: user.profile_first_name
					? user.profile_first_name
					: '',
			id: user.id,
			isAccountVerified: user.is_account_verified,
			isPrivacyPolicyAgreed: user.is_privacy_policy_agreed,
			isTermsAndConditionAccepted: user.is_terms_and_condition_accepted,
			lastName: user.last_name
				? user.last_name
				: user.profile_last_name
					? user.profile_last_name
					: '',
			organization: user.organization,
			organizationId: user.org_id,
			organizationUuid: user.org_uuid,
			phone: user.phone,
			preferences: user.user_preferences,
			profilePicUrl: user.profile_pic_url,
			roleName: currentUser.organizationRole,
			uuid: user.uuid,
		});
	}

	async createInvitedUser(invitedUserDto: InviteUserDto): Promise<any> {
		try {
			const userRecord = await this.auth.createUser({
				email: invitedUserDto.email,
				displayName: `${invitedUserDto.firstName} ${invitedUserDto.lastName}`,
			});
			return userRecord;
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			this.logger.error(
				`Firebase Error creating user: ${invitedUserDto.email} - ${firebaseErrorMessage}`,
			);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	async getInvitationToken(invitedUserDto: InviteUserDto): Promise<string> {
		const secret = this.configService.get<string>('KLUBIQ_ADMIN_API_KEY');
		const token = createHmac('sha256', secret)
			.update(
				`${invitedUserDto.email}|${invitedUserDto.firstName}||${invitedUserDto.lastName}`,
			)
			.digest('hex');
		return token;
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
