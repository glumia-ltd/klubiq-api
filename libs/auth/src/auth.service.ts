import { FirebaseAuthenticationService } from '@aginix/nestjs-firebase-admin';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ICreateFirebaseUser } from './types/firebase.types';
import { Auth, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { FirebaseError, initializeApp } from 'firebase/app';

@Injectable()
export class AuthService {
	private auth: Auth;
	constructor(private firebaseAuth: FirebaseAuthenticationService) {
		const firebaseConfig = JSON.parse(process.env.FIREBASE_SDK_CONFIG);
		const app = initializeApp(firebaseConfig);
		this.auth = getAuth(app);
	}

	async createUser(newUser: ICreateFirebaseUser) {
		try {
			const firebaseUser = await createUserWithEmailAndPassword(
				this.auth,
				newUser.email,
				newUser.password,
			);
			// const firebaseUser = await this.firebaseAuth.auth.createUser(newUser);
			return firebaseUser.user;
		} catch (err) {}
	}

	async getUser(uid: string) {
		try {
			const firebaseUser = await this.firebaseAuth.auth.getUser(uid);
			return firebaseUser;
		} catch (err) {
			// TODO: Add the logger service here
			throw new ForbiddenException(err.message);
		}
	}

	async deleteUser(uid: string) {
		try {
			const result = await this.firebaseAuth.auth.deleteUser(uid);
			return result;
		} catch (err) {
			// TODO: Add the logger service here
			throw new ForbiddenException(err.message);
		}
	}

	async changeUserPassword(uid: string, newPassword: string) {
		try {
			const updatedPassword = await this.firebaseAuth.auth.updateUser(uid, {
				password: newPassword,
			});
			return updatedPassword;
			// Password update was successful
		} catch (err) {
			// TODO: Add the logger service here
			throw new Error(
				'Failed to change the password. Please make sure the user exists and try again.',
			);
		}
	}

	async resetPassword(email: string) {
		try {
			const resetPasswordLink =
				await this.firebaseAuth.generatePasswordResetLink(email);
			return resetPasswordLink;
		} catch (err) {
			// TODO: Add the logger service here
			throw new ForbiddenException(err.message);
		}
	}

	async verifyEmail(email: string) {
		try {
			const verifyEmailLink =
				await this.firebaseAuth.generateEmailVerificationLink(email);
			return verifyEmailLink;
		} catch (err) {
			// TODO: Add the logger service here
			throw new Error(err.message);
		}
	}

	async updateUserWithVerifiedEmail(id: string) {
		try {
			await this.firebaseAuth.updateUser(id, {
				emailVerified: true,
			});
		} catch (err) {
			// TODO: Add the logger service here
			throw new ForbiddenException(err.message);
		}
	}

	async getUserEmailVerificationStatus(email: string) {
		const firebaseUser = await this.firebaseAuth.getUserByEmail(email);
		return firebaseUser;
	}

	// The function to parse Firebase errors
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
