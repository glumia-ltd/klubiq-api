import { MailerSendService } from '@app/common/email/email.service';
import {
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as auth from 'firebase-admin/auth';
import { FirebaseException } from './exception/firebase.exception';
import { userLoginDto, OrgUserSignUpDto } from './dto/user-login.dto';
import {
	RenterLoginResponseDto,
	SignUpResponseDto,
} from './dto/auth-response.dto';
import { Auth, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { EntityManager } from 'typeorm';
import { OrganizationRepository } from '../../../apps/klubiq-dashboard/src/organization/organization.repository';
import {
	OrganizationRole,
	Role,
	UserProfile,
	CreateUserEventTypes,
	UserProfilesRepository,
	UserRoles,
} from '@app/common';
import { Organization } from '../../../apps/klubiq-dashboard/src/organization/entities/organization.entity';
import { OrganizationUser } from '../../../apps/klubiq-dashboard/src/users/entities/organization-user.entity';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { FirebaseErrorMessageHelper } from './helpers/firebase-error-helper';

@Injectable()
export class AuthService {
	private firebaseClientAuth: Auth;
	constructor(
		@Inject('FIREBASE_ADMIN') private firebaseAdminApp: admin.app.App,
		@Inject('FIREBASE_AUTH') private firebaseClient: any,
		@InjectMapper() private readonly mapper: Mapper,
		private emailService: MailerSendService,
		private readonly organizationRepository: OrganizationRepository,
		private readonly userProfilesRepository: UserProfilesRepository,
		private readonly errorMessageHelper: FirebaseErrorMessageHelper,
	) {
		this.firebaseClientAuth = getAuth(this.firebaseClient);
	}

	get auth(): auth.Auth {
		return this.firebaseAdminApp.auth();
	}

	get clientAuth() {
		return this.firebaseClientAuth;
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
				fbid = null;
				await this.sendVerificationEmail(createUserDto.email, displayName);
				return await this.createCustomToken(userProfile.firebaseId);
			}
			return undefined;
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

	async generateVerificationEmail(uid: string): Promise<void> {
		try {
			const user = await this.auth.getUser(uid);
			if (!user) {
				throw new Error('User not found');
			}
			await this.auth.generateEmailVerificationLink(user.email);
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
			await this.auth.generatePasswordResetLink(email);
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

	async markUserEmailVerified(uid: string): Promise<void> {
		try {
			const user = await this.auth.updateUser(uid, {
				emailVerified: true,
			});
			if (!user) {
				throw new Error('User not found');
			}
		} catch (err) {
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	async verifyEmail(oobCode: string): Promise<void> {
		try {
			const decodedToken = await admin.auth().verifyIdToken(oobCode);
			const uid = decodedToken.uid;

			console.log('User successfully verified!');

			// Update user's verification status in your database
			await admin.auth().updateUser(uid, { emailVerified: true });
		} catch (err) {
			console.error('Error verifying code:', err);
			const firebaseErrorMessage =
				this.errorMessageHelper.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	async sendVerificationEmail(email: string, name: string): Promise<void> {
		// TODO : WHEN APP IS INTEGRATED AND UI  SCREENS ARE READY
		// const serverVerifyEmailEndpoint = 'https://your-app.com/verify-email';

		// const actionCodeSettings = {
		// 	url: serverVerifyEmailEndpoint,
		// 	handleCodeInApp: false,
		// 	continueUrl: serverVerifyEmailEndpoint,
		// };

		try {
			const verificationLink = await admin
				.auth()
				.generateEmailVerificationLink(email);

			await this.emailService.sendVerifyEmail(email, name, verificationLink);
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

	async login(login: userLoginDto) {
		const existingUser = await this.userProfilesRepository.getUserLoginInfo(
			login.email,
		);
		if (!existingUser) {
			throw new UnauthorizedException(
				'You do not have an account, kindly register before trying to log in',
			);
		}

		const result = await signInWithEmailAndPassword(
			this.firebaseClientAuth,
			login.email,
			login.password,
		)
			.then(async (userCredential) => {
				// Signed in
				const user = userCredential.user;
				// check if user is verified
				if (!user.emailVerified) {
					// send verification email to user
					await this.sendVerificationEmail(user.email, user.displayName);
					// send error response to user asking to verify email
					throw new UnauthorizedException(
						'Kindly verify your email, check your email for verification link',
					);
				}

				// TODO: send user and email saying that they successfully logged in
				const userData = this.mapper.map(
					existingUser,
					UserProfile,
					RenterLoginResponseDto,
				);
				return {
					user: userData,
					token: (await userCredential.user.getIdTokenResult()).token,
					refreshToken: user.refreshToken,
				};
			})
			.catch(async (error) => {
				const firebaseErrorMessage =
					this.errorMessageHelper.parseFirebaseError(error);
				throw new FirebaseException(
					firebaseErrorMessage ? firebaseErrorMessage : error.message,
				);
			});
		return result;
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
		const existingOrganization = await entityManager.findOne(Organization, {
			where: { name: name },
		});

		// IF IT'S A SIGNUP EVENT, THROW AN EXCEPTION  AS IT SHOULD BE A NEW ORGANIZATION. IF IT'S INVITE EVENT, USE THE EXISTING ORGANIZATION
		if (existingOrganization) {
			if (createEventType === CreateUserEventTypes.CREATE_ORG_USER) {
				throw new ForbiddenException('Organization already exists');
			}
			return existingOrganization;
		}

		const newOrganization = new Organization();
		newOrganization.name = name;
		return entityManager.save(newOrganization);
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

			const systemRole = await this.getSystemRole(
				transactionalEntityManager,
				UserRoles.LANDLORD,
			);
			const organizationRole = await this.getOrgRole(
				transactionalEntityManager,
				UserRoles.ORG_OWNER,
			);
			const permissions = organizationRole.featurePermissions.map(
				(featurePermission) => {
					return featurePermission.alias;
				},
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
				permissions: permissions,
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

			//   if (decodedToken) {
			// 	// Check for system roles
			// 	if (decodedToken['systemRole']) {
			// 	  userRoles.push(decodedToken['systemRole'] as UserRoles);
			// 	}

			// 	// Check for organization roles
			// 	if (decodedToken['organizationRole']) {
			// 	  userRoles.push(decodedToken['organizationRole'] as UserRoles);
			// 	}

			// 	// Add other roles as needed
			// 	if (decodedToken['superAdminRole']) {
			// 	  userRoles.push(decodedToken['superAdminRole'] as UserRoles);
			// 	}

			// 	if (decodedToken['adminRole']) {
			// 	  userRoles.push(decodedToken['adminRole'] as UserRoles);
			// 	}

			// 	if (decodedToken['tenantRole']) {
			// 	  userRoles.push(decodedToken['tenantRole'] as UserRoles);
			// 	}

			// 	if (decodedToken['propertyManagerRole']) {
			// 	  userRoles.push(decodedToken['propertyManagerRole'] as UserRoles);
			// 	}

			// 	if (decodedToken['propertyOwnerRole']) {
			// 	  userRoles.push(decodedToken['propertyOwnerRole'] as UserRoles);
			// 	}

			// 	if (decodedToken['leaseManagerRole']) {
			// 	  userRoles.push(decodedToken['leaseManagerRole'] as UserRoles);
			// 	}
			//   }

			return userRoles;
		} catch (error) {
			console.error('Error decoding token:', error);
			return [];
		}
	}
}
