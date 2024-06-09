import {
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as auth from 'firebase-admin/auth';
import { FirebaseException } from '../exception/firebase.exception';
import {
	InviteUserDto,
	ResetPasswordDto,
	//UpdateFirebaseUserDto,
} from '../dto/user-login.dto';
import {
	AuthUserResponseDto,
	TokenResponseDto,
} from '../dto/auth-response.dto';
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
@Injectable()
export abstract class AuthService {
	protected abstract readonly logger: Logger;
	constructor(
		@Inject('FIREBASE_ADMIN') protected firebaseAdminApp: admin.app.App,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		private readonly userProfilesRepository: UserProfilesRepository,
		protected readonly errorMessageHelper: FirebaseErrorMessageHelper,
		protected readonly configService: ConfigService,
		private readonly httpService: HttpService,
		protected readonly cls: ClsService<SharedClsStore>,
	) {}

	get auth(): auth.Auth {
		return this.firebaseAdminApp.auth();
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

	async resetPassword(resetPassword: ResetPasswordDto) {
		try {
			const body = {
				oobCode: resetPassword.oobCode,
				newPassword: resetPassword.newPassword,
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
			console.error('Error resetting password:', err);
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
			return data;
		} catch (err) {
			console.error('Error verifying code:', err);
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

	async getUserRolesFromToken(token: string): Promise<UserRoles[]> {
		try {
			//   const decodedToken = this.jwtService.decode(token);
			const decodedToken = await this.auth.verifyIdToken(token);
			const systemRole = decodedToken.systemRole;
			const organizationRole = decodedToken.organizationRole;
			const userRoles: UserRoles[] = [];
			if (!!systemRole) {
				userRoles.push(systemRole);
			}
			if (!!organizationRole) {
				userRoles.push(organizationRole);
			}

			return userRoles;
		} catch (error) {
			console.error('Error decoding token:', error);
			return [];
		}
	}

	async getUserInfo(): Promise<AuthUserResponseDto> {
		const user_id = this.cls.get('currentUser')?.uid;
		if (!user_id) {
			throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
		}
		const user = await this.userProfilesRepository.getUserLoginInfo(user_id);
		const userData = this.mapper.map(user, UserProfile, AuthUserResponseDto);
		return userData;
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
		const secret = this.configService.get<string>('ADMIN_API_KEY');
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
