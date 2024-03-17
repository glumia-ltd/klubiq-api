import { MailerSendService } from '@app/common/email/email.service';
import { MailerSendSMTPService } from '@app/common/email/smtp-email.service';
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as auth from 'firebase-admin/auth';
import { FirebaseError } from 'firebase/app';
import { userLoginDto } from './dto/user-login.dto';
import { UsersService } from 'apps/klubiq-dashboard/src/users/users.service';
import { Auth, getAuth, signInWithEmailAndPassword } from 'firebase/auth';

@Injectable()
export class AuthService {
	private firebaseClientAuth: Auth;
	constructor(
		@Inject('FIREBASE_ADMIN') private firebaseAdminApp: admin.app.App,
		@Inject('FIREBASE_AUTH') private firebaseClient: any,
		private emailService: MailerSendService,
		private emailSmtpService: MailerSendSMTPService,
		private userService: UsersService,
	) {
		this.firebaseClientAuth = getAuth(this.firebaseClient);
	}

	get auth(): auth.Auth {
		return this.firebaseAdminApp.auth();
	}

	get clientAuth() {
		return this.firebaseClientAuth;
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
			console.log('userRecord', userRecord);
			return userRecord;
		} catch (err) {
			const firebaseErrorMessage = this.parseFirebaseError(err);
			console.log('firebaseError', err);
			return firebaseErrorMessage ? firebaseErrorMessage : err.message;
		}
	}

	async getUser(uid: string) {
		try {
			// Use the correct import and access auth through getAuth:
			const userRecord = await this.auth.getUser(uid);
			return userRecord;
		} catch (err) {
			const firebaseErrorMessage = this.parseFirebaseError(err);
			// Handle the error appropriately, such as logging or returning a custom message:
			console.error('Error fetching user:', err);
			return firebaseErrorMessage
				? firebaseErrorMessage
				: 'An error occurred while retrieving the user.';
		}
	}

	async updateUser(
		uid: string,
		updateData: { email?: string; password?: string },
	): Promise<void> {
		try {
			const user = await this.auth.getUser(uid);
			if (!user) {
				throw new Error('User not found');
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
			return firebaseErrorMessage ? firebaseErrorMessage : err.message;
		}
	}

	async deleteUser(uid: string): Promise<void> {
		try {
			await this.auth.deleteUser(uid);
		} catch (err) {
			const firebaseErrorMessage = this.parseFirebaseError(err);
			return firebaseErrorMessage ? firebaseErrorMessage : err.message;
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
			return firebaseErrorMessage ? firebaseErrorMessage : err.message;
		}
	}

	async generatePasswordResetEmail(email: string): Promise<void> {
		try {
			await this.auth.generatePasswordResetLink(email);
		} catch (err) {
			const firebaseErrorMessage = this.parseFirebaseError(err);
			return firebaseErrorMessage ? firebaseErrorMessage : err.message;
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
			return firebaseErrorMessage ? firebaseErrorMessage : err.message;
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
			return firebaseErrorMessage ? firebaseErrorMessage : err.message;
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
			return firebaseErrorMessage ? firebaseErrorMessage : err.message;
		}
	}

	async sendVerificationEmail(email: string, name: string): Promise<void> {
		const serverVerifyEmailEndpoint = 'https://your-app.com/verify-email';

		try {
			const actionCodeSettings = {
				url: serverVerifyEmailEndpoint,
				handleCodeInApp: true,
				continueUrl: serverVerifyEmailEndpoint,
			};

			const verificationLink = await admin
				.auth()
				.generatePasswordResetLink(email, actionCodeSettings);
			console.log('verificationLink', verificationLink);
			//TO:DO send email to user with verificationLink
			await this.emailService.sendVerifyEmail(email, name, verificationLink);
		} catch (err) {
			const firebaseErrorMessage = this.parseFirebaseError(err);
			return firebaseErrorMessage ? firebaseErrorMessage : err.message;
		}
	}

	async exchangeGoogleToken(authorizationCode: string) {
		try {
			const auth = admin.auth();

			const credential = await auth.verifyIdToken(authorizationCode);

			const accessToken = credential.accessToken;
			const idToken = credential.idToken;

			const uid = credential.uid;
			const displayName = credential.name;
			const email = credential.email;

			return { accessToken, idToken, uid, displayName, email };
		} catch (error) {
			console.error('Error exchanging Google token:', error);
			throw error;
		}
	}

	async login(login: userLoginDto) {
		const existingUser = await this.userService.findByEmail(login.email);
		console.log(existingUser);
		if (!existingUser) {
			return {
				error: true,
				status: 400,
				message:
					'You do not have an account, kindly register before trying to log in',
			};
		}

		const result = await signInWithEmailAndPassword(
			this.firebaseClientAuth,
			login.email,
			login.password,
		)
			.then(async (userCredential) => {
				// Signed in
				const user = userCredential.user;
				console.log('fireUser', user);
				// check if user is verified
				if (!user.emailVerified) {
					// send verification email to user
					await this.sendVerificationEmail(user.email, user.displayName);
					// send error response to user asking to verify email
					return {
						error: true,
						errorCode: 400,
						message:
							'Kindly verify your email, check your email for verification link',
						data: null,
					};
				}

				// TODO: send user and email saying that they successfully logged in
				return {
					user: existingUser,
					token: (await userCredential.user.getIdTokenResult()).token,
					refreshToken: user.refreshToken,
				};
			})
			.catch(async (error) => {
				// TODO: Add the logger service here
				const match = error.message.match(/Firebase: Error \((.*?)\)/);
				if (match && match[1]) {
					const firebaseErrorMessage = match[1];
					error.message = firebaseErrorMessage;
				}

				if (error.message === 'auth/wrong-password') {
				}
				return {
					error: true,
					errorCode: 401,
					message: error.message,
					data: null,
				};
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
}
