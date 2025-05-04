import { MailerSendService } from '@app/common/email/email.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { replace, split } from 'lodash';
import { ClsService } from 'nestjs-cls';
import { Inject } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import * as admin from 'firebase-admin';
import { FirebaseException } from '../exception/firebase.exception';
import { InviteUserDto } from '../dto/requests/user-login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OrganizationRepository } from '../../../../apps/klubiq-dashboard/src/organization/repositories/organization.repository';
import { UserProfilesRepository } from '@app/common/repositories/user-profiles.repository';
import { EmailTemplates } from '@app/common/email/types/email.types';
import { ErrorMessages } from '@app/common/config/error.constant';
import { Mapper } from '@automapper/core';
import { FirebaseErrorMessageHelper } from '../helpers/firebase-error-helper';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { AuthService } from './auth.service';
import { UserInvitation } from '@app/common/database/entities/user-invitation.entity';
import { DateTime } from 'luxon';
import { CreateSuperAdminDTO } from '../dto/requests/admin-user.dto';
import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import { UserRecord } from 'firebase-admin/auth';
import { OrganizationSettingsService } from '@app/common/services/organization-settings.service';
import { UserPreferencesService } from '@app/common/services/user-preferences.service';
import { OrganizationSubscriptionService } from '@app/common/services/organization-subscription.service';
import { NotificationsSubscriptionService } from '@app/notifications/services/notifications-subscription.service';
import { TenantRepository } from '@app/common/repositories/tenant.repository';
import { Generators } from '@app/common/helpers/generators';
import { ApiDebugger } from '@app/common/helpers/debug-loggers';

@Injectable()
export class AdminAuthService extends AuthService {
	private readonly emailVerificationBaseUrl: string;
	private readonly emailAuthContinueUrl: string;
	protected readonly timestamp = DateTime.utc().toSQL({ includeOffset: false });
	protected readonly logger = new Logger(AdminAuthService.name);
	constructor(
		@Inject('FIREBASE_ADMIN') firebaseAdminApp: admin.app.App,
		@InjectMapper('MAPPER') mapper: Mapper,
		@Inject(CACHE_MANAGER) protected cacheManager: Cache,
		protected readonly emailService: MailerSendService,
		private readonly organizationRepository: OrganizationRepository,
		userProfilesRepository: UserProfilesRepository,
		protected readonly errorMessageHelper: FirebaseErrorMessageHelper,
		protected readonly configService: ConfigService,
		httpService: HttpService,
		protected readonly cls: ClsService<SharedClsStore>,
		protected readonly organizationSettingsService: OrganizationSettingsService,
		protected readonly userPreferencesService: UserPreferencesService,
		protected readonly organizationSubscriptionService: OrganizationSubscriptionService,
		protected readonly notificationSubService: NotificationsSubscriptionService,
		protected readonly tenantRepository: TenantRepository,
		protected readonly generators: Generators,
		protected readonly apiDebugger: ApiDebugger,
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
		);
		this.emailVerificationBaseUrl = this.configService.get<string>(
			'EMAIL_VERIFICATION_BASE_URL',
		);
		this.emailAuthContinueUrl =
			this.configService.get<string>('CONTINUE_URL_PATH');
	}

	async createDomainSuperAdmin(dto: CreateSuperAdminDTO): Promise<any> {
		const displayName = dto.username;
		let fbid = '';
		try {
			const user = await this.auth.createUser({
				email: `${dto.username}@${dto.domain}`,
				password: dto.password,
				displayName: displayName,
				emailVerified: true,
			});
			if (!user) {
				throw new FirebaseException(ErrorMessages.USER_NOT_CREATED);
			}
			fbid = user.uid;
			const adminUser = this.createAdminUser(user);
			fbid = null;
			return adminUser;
		} catch (error) {
			await this.deleteUser(fbid);
			throw new FirebaseException(error);
		}
	}

	private async createAdminUser(firebaseUser: UserRecord): Promise<any> {
		const entityManager = this.organizationRepository.manager;
		return entityManager.transaction(async (transactionalEntityManager) => {
			const userProfile = new UserProfile();
			userProfile.email = firebaseUser.email;
			userProfile.firebaseId = firebaseUser.uid;
			userProfile.isPrivacyPolicyAgreed = true;
			userProfile.isTermsAndConditionAccepted = true;
			await transactionalEntityManager.save(userProfile);
			await this.setCustomClaims(userProfile.firebaseId, {
				kUid: userProfile.profileUuid,
			});
			return userProfile;
		});
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

	override async sendInvitationEmail(
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
			resetPasswordLink += `&email=${invitedUserDto.email}&type=user-invitation&invited_as=${invitation.orgRole.name}`;
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

	override async inviteUser(invitedUserDto: InviteUserDto): Promise<any> {
		let fbid: string;
		try {
			await this.createInvitedUser(invitedUserDto);
		} catch (error) {
			await this.deleteUser(fbid);
			throw new FirebaseException(error);
		}
	}
}
