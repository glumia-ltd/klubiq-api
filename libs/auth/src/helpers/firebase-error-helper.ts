import { FirebaseError } from '../types/firebase.types';

export enum FirebaseErrors {
	EMAIL_EXISTS = 'auth/email-already-in-use',
	INVALID_EMAIL = 'auth/invalid-email',
	USER_DISABLED = 'auth/user-disabled',
	USER_NOT_FOUND = 'auth/user-not-found',
	WRONG_PASSWORD = 'auth/wrong-password',
	INVALID_PASSWORD = 'auth/invalid-password',
	INVALID_USER = 'auth/invalid-user',
	USER_EXISTS = 'auth/user-already-exists',
	TOO_MANY_ATTEMPTS = 'auth/too-many-attempts',
	PERMISSION_DENIED = 'auth/permission-denied',
	NOT_FOUND = 'auth/not-found',
	UNAUTHORIZED = 'auth/unauthorized',
	UNAUTHENTICATED = 'auth/unauthenticated',
	STORAGE_OBJECT_NOT_FOUND = 'storage/object-not-found',
	STORAGE_UNAUTHORIZED = 'storage/unauthorized',
	STORAGE_UNSUPPORTED_OPERATION = 'storage/unsupported-operation',
	STORAGE_CANCELLED = 'storage/cancelled',
	INVALID_CREDENTIAL = 'auth/invalid-credential',
}
export const Firebase_Errors = [
	{
		code: FirebaseErrors.EMAIL_EXISTS,
		message: 'This email is already in use. Please use a different email.',
	},
	{
		code: FirebaseErrors.INVALID_EMAIL,
		message:
			'The email address is not valid. Please enter a valid email address.',
	},
	{
		code: FirebaseErrors.WRONG_PASSWORD,
		message: 'Incorrect Email/Password. Please try again.',
	},
	{
		code: FirebaseErrors.USER_NOT_FOUND,
		message: 'No user found with this email. Please sign up first.',
	},
	{
		code: FirebaseErrors.USER_DISABLED,
		message: 'This user has been disabled. Please contact support.',
	},
	{
		code: FirebaseErrors.INVALID_PASSWORD,
		message: 'Invalid Email/Password. Please try again.',
	},
	{
		code: FirebaseErrors.INVALID_USER,
		message: 'Invalid User. Please try again.',
	},
	{
		code: FirebaseErrors.USER_EXISTS,
		message:
			'User already has a previous account. Please sign in with your username and password.',
	},
	{
		code: FirebaseErrors.TOO_MANY_ATTEMPTS,
		message: 'Too many attempts. Please try again later.',
	},
	{
		code: FirebaseErrors.NOT_FOUND,
		message: 'The requested resource does not exist.',
	},
	{
		code: FirebaseErrors.STORAGE_OBJECT_NOT_FOUND,
		message: 'No object exists at the desired reference.',
	},
	{
		code: FirebaseErrors.STORAGE_UNAUTHORIZED,
		message: 'You are not authorized to perform this operation.',
	},
	{
		code: FirebaseErrors.INVALID_CREDENTIAL,
		message:
			'The email address or password is not valid. Please enter a valid email address or password',
	},
] as FirebaseError[];

export class FirebaseErrorMessageHelper {
	parseFirebaseError(error: FirebaseError): string {
		console.log('Firebase error: ', error);
		return (
			Firebase_Errors.find((e) => e.code === error.code)?.message ||
			'An unexpected error occurred. Please try again.'
		);
	}
}
