import { MailerSendService } from '@app/common/email/email.service';
import { MailerSendSMTPService } from '@app/common/email/smtp-email.service';
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as auth from 'firebase-admin/auth';
import { FirebaseException } from './exception/firebase.exception';
import { FirebaseError } from 'firebase/app';
import { userLoginDto, OrgUserSignUpDto } from './dto/user-login.dto';
import {
	RenterLoginResponseDto,
	SignUpResponseDto,
} from './dto/auth-response.dto';
import { UsersService } from 'apps/klubiq-dashboard/src/users/users.service';
import { Auth, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { EntityManager } from 'typeorm';
import { OrganizationRepository } from 'apps/klubiq-dashboard/src/organization/organization.repository';
import {
	LANDLORD_ROLE,
	ORG_OWNER_ROLE,
	OrganizationRole,
	Role,
	UserProfile,
} from '@app/common';
import { Organization } from 'apps/klubiq-dashboard/src/organization/entities/organization.entity';
import { OrganizationUser } from 'apps/klubiq-dashboard/src/users/entities/organization-user.entity';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';

@Injectable()
export class AuthService {
	private firebaseClientAuth: Auth;
	constructor(
		@Inject('FIREBASE_ADMIN') private firebaseAdminApp: admin.app.App,
		@Inject('FIREBASE_AUTH') private firebaseClient: any,
		@InjectMapper() private readonly mapper: Mapper,
		private emailService: MailerSendService,
		private emailSmtpService: MailerSendSMTPService,
		private userService: UsersService,
		private readonly organizationRepository: OrganizationRepository,
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
				);
				fbid = null;
				await this.sendVerificationEmail(createUserDto.email, displayName);
				return await this.createCustomToken(
					userProfile.firebaseId,
					userProfile.systemRole.name,
					userProfile.organizationUser.orgRole.name,
				);
			}
			return undefined;
		} catch (error) {
			await this.deleteUser(fbid);
			throw new FirebaseException(error);
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
			const firebaseErrorMessage = this.parseFirebaseError(err);
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
			const firebaseErrorMessage = this.parseFirebaseError(err);
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
			const firebaseErrorMessage = this.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	async deleteUser(uid: string): Promise<void> {
		try {
			await this.auth.deleteUser(uid);
		} catch (err) {
			const firebaseErrorMessage = this.parseFirebaseError(err);
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
			const firebaseErrorMessage = this.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}

	async generatePasswordResetEmail(email: string): Promise<void> {
		try {
			await this.auth.generatePasswordResetLink(email);
		} catch (err) {
			const firebaseErrorMessage = this.parseFirebaseError(err);
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
			const firebaseErrorMessage = this.parseFirebaseError(err);
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
			const firebaseErrorMessage = this.parseFirebaseError(err);
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
			const firebaseErrorMessage = this.parseFirebaseError(err);
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
			const firebaseErrorMessage = this.parseFirebaseError(err);
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
			const existingUser = await this.userService.findByEmail(email);

			return { user: existingUser, accessToken: accessToken, idToken: idToken };
		} catch (error) {
			const firebaseErrorMessage = this.parseFirebaseError(error);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : error.message,
			);
		}
	}

	async login(login: userLoginDto) {
		const existingUser = await this.userService.findByEmail(login.email);
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
				const firebaseErrorMessage = this.parseFirebaseError(error);
				throw new FirebaseException(
					firebaseErrorMessage ? firebaseErrorMessage : error.message,
				);
			});
		return result;
	}

	async sendDummy() {
		try {
			await this.emailService.sendDummmyEmail();
		} catch (err) {}
	}

	async sendDummySmtp() {
		try {
			const dummyEmail = await this.emailSmtpService.sendDummmyEmail();
			console.log('dummyEmail', dummyEmail);
			return dummyEmail;
		} catch (err) {}
	}

	async createCustomToken(
		firebaseId: string,
		systemRole: string,
		orgRole: string,
	): Promise<any> {
		try {
			const claims = {
				systemRole,
				orgRole,
			};
			const jwtToken = await this.auth.createCustomToken(firebaseId, claims);
			return jwtToken;
		} catch (err) {
			const firebaseErrorMessage = this.parseFirebaseError(err);
			throw new FirebaseException(
				firebaseErrorMessage ? firebaseErrorMessage : err.message,
			);
		}
	}
	parseFirebaseError(error: FirebaseError): string {
		let errorMessage: string;

		switch (error.code) {
			// Authentication Errors
			case 'auth/email-already-in-use':
				errorMessage =
					'This email is already in use. Please use a different email.';
				break;
			case 'auth/invalid-email':
				errorMessage =
					'The email address is not valid. Please enter a valid email address.';
				break;
			case 'auth/wrong-password':
				errorMessage = 'Incorrect Email/Password. Please try again.';
				break;
			case 'auth/user-not-found':
				errorMessage = 'No user found with this email. Please sign up first.';
				break;
			case 'auth/user-disabled':
				errorMessage = 'This user has been disabled. Please contact support.';
				break;
			case 'auth/too-many-requests':
				errorMessage = 'Too many attempts. Please try again later.';
				break;

			// Firestore Errors
			case 'permission-denied':
				errorMessage = 'You do not have permission to access this resource.';
				break;
			case 'not-found':
				errorMessage = 'The requested resource does not exist.';
				break;

			// Storage Errors
			case 'storage/object-not-found':
				errorMessage = 'No object exists at the desired reference.';
				break;
			case 'storage/unauthorized':
				errorMessage = 'You are not authorized to perform this operation.';
				break;

			// Default case for any other error
			default:
				errorMessage = 'An unexpected error occurred. Please try again.';
		}

		return errorMessage;
	}

	//PRIVATE METHODS FOR GETTING SYSTEM AND ORGANIZATION ROLES
	private async getLandlordRole(entityManager: EntityManager): Promise<Role> {
		return await entityManager.findOne(Role, {
			where: { name: LANDLORD_ROLE },
		});
	}

	private async getOrgOwnerRole(
		entityManager: EntityManager,
	): Promise<OrganizationRole> {
		return await entityManager.findOne(OrganizationRole, {
			where: { name: ORG_OWNER_ROLE },
		});
	}

	private async findOrCreateOrganization(
		name: string,
		entityManager: EntityManager,
	): Promise<Organization> {
		const existingOrganization = await entityManager.findOne(Organization, {
			where: { name: name },
		});

		if (existingOrganization) {
			return existingOrganization;
		}

		const newOrganization = new Organization();
		newOrganization.name = name;
		return entityManager.save(newOrganization);
	}

	private async createUserWithOrganization(
		fireUser: any,
		createUserDto: OrgUserSignUpDto,
	): Promise<UserProfile> {
		const entityManager = this.organizationRepository.manager;
		return entityManager.transaction(async (transactionalEntityManager) => {
			const organization = await this.findOrCreateOrganization(
				createUserDto.companyName, // Assuming this is the correct property name
				transactionalEntityManager,
			);
			const systemRole = await this.getLandlordRole(transactionalEntityManager);
			const organizationRole = await this.getOrgOwnerRole(
				transactionalEntityManager,
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

			await transactionalEntityManager.save(user);
			await transactionalEntityManager.save(userProfile);

			return userProfile;
		});
	}
}
