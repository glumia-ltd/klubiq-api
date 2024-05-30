import { MailerSendService } from '@app/common/email/email.service';
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { replace, split } from 'lodash';
import { ClsService } from 'nestjs-cls';
import { Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as auth from 'firebase-admin/auth';
import { FirebaseException } from './exception/firebase.exception';
import { OrgUserSignUpDto } from './dto/user-login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
	AuthUserResponseDto,
	SignUpResponseDto,
	TokenResponseDto,
} from './dto/auth-response.dto';
import { EntityManager } from 'typeorm';
import { OrganizationRepository } from '../../../apps/klubiq-dashboard/src/organization/organization.repository';
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
import { Organization } from '../../../apps/klubiq-dashboard/src/organization/entities/organization.entity';
import { OrganizationUser } from '../../../apps/klubiq-dashboard/src/users/entities/organization-user.entity';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { FirebaseErrorMessageHelper } from './helpers/firebase-error-helper';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CacheService } from '@app/common/services/cache.service';
import {
	OrgRoleResponseDto,
	ViewSystemRoleDto,
} from '@app/common/dto/responses/org-role.dto';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';

@Injectable()
export class AuthService {
	private readonly emailVerificationBaseUrl: string;
	private readonly emailAuthContinueUrl: string;
	private readonly logger = new Logger(AuthService.name);
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		@Inject('FIREBASE_ADMIN') private firebaseAdminApp: admin.app.App,
		@InjectMapper() private readonly mapper: Mapper,
		private emailService: MailerSendService,
		private readonly organizationRepository: OrganizationRepository,
		private readonly userProfilesRepository: UserProfilesRepository,
		private readonly errorMessageHelper: FirebaseErrorMessageHelper,
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
		private readonly cls: ClsService<SharedClsStore>,
	) {
		this.emailVerificationBaseUrl = this.configService.get<string>(
			'EMAIL_VERIFICATION_BASE_URL',
		);
		this.emailAuthContinueUrl =
			this.configService.get<string>('CONTINUE_URL_PATH');
	}

	get auth(): auth.Auth {
		return this.firebaseAdminApp.auth();
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

	async generatePasswordResetEmail(email: string): Promise<void> {
		try {
			const user = await this.auth.getUserByEmail(email);
			const name = split(user.displayName, ' ');
			if (!user) {
				throw new NotFoundException('User not found');
			}
			const resetPasswordLink = await this.auth.generatePasswordResetLink(
				email,
				this.getActionCodeSettings(),
			);
			const actionUrl = replace(resetPasswordLink, '_auth_', 'forgotPassword');
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

	async sendVerificationEmail(
		email: string,
		firstName: string,
		lastName: string,
	): Promise<void> {
		try {
			const verificationLink = await admin
				.auth()
				.generateEmailVerificationLink(email, this.getActionCodeSettings());
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

	async exchangeGoogleToken(authorizationCode: string) {
		try {
			const auth = admin.auth();

			const credential = await auth.verifyIdToken(authorizationCode);

			const accessToken = credential.accessToken;
			const idToken = credential.idToken;
			const email = credential.email;
			const existingUser = await this.userProfilesRepository.findOneByCondition(
				{ email: email },
			);

			return { user: existingUser, accessToken: accessToken, idToken: idToken };
		} catch (error) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(error);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : error.message,
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

	async checkUserExist(email: string): Promise<boolean> {
		try {
			return await this.userProfilesRepository.checkUerExist(email);
		} catch (err) {
			throw err;
		}
	}

	//PRIVATE METHODS FOR GETTING SYSTEM AND ORGANIZATION ROLES
	private async getSystemRole(
		entityManager: EntityManager,
		roleName: UserRoles,
	): Promise<Role> {
		return await entityManager.findOne(Role, {
			where: { name: roleName },
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
				)) ??
				(await this.getSystemRole(
					transactionalEntityManager,
					UserRoles.LANDLORD,
				));
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

	getActionCodeSettings() {
		return {
			url: `${this.emailVerificationBaseUrl}${this.emailAuthContinueUrl}`,
		};
	}
}
