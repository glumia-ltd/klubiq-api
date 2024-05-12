import { FirebaseError } from '../types/firebase.types';

export enum FirebaseAdminErrors {
	// Firebase Auth errors
	AUTH_EMAIL_ALREADY_EXISTS = 'auth/email-already-exists',
	AUTH_PHONE_NUMBER_ALREADY_EXISTS = 'auth/phone-number-already-exists',
	AUTH_PROJECT_NOT_FOUND = 'auth/project-not-found',
	AUTH_UID_ALREADY_EXISTS = 'auth/uid-already-exists',
	AUTH_EXPIRED_TOKEN = 'auth/id-token-expired',
	AUTH_REVOKED_TOKEN = 'auth/id-token-revoked',
	AUTH_USER_NOT_FOUND = 'auth/user-not-found',
	AUTH_INSUFFICIENT_PERMISSION = 'auth/insufficient-permission',
	AUTH_INVALID_UID = 'auth/invalid-uid',
	AUTH_INVALID_EMAIL = 'auth/invalid-email',
	AUTH_INVALID_PHONE_NUMBER = 'auth/invalid-phone-number',
	AUTH_INVALID_PASSWORD = 'auth/invalid-password',
	AUTH_INVALID_PROVIDER_ID = 'auth/invalid-provider-id',
	AUTH_INVALID_CREDENTIAL = 'auth/invalid-credential',
	AUTH_INVALID_DISABLED_FIELD = 'auth/invalid-disabled-field',
	AUTH_INVALID_DISPLAY_NAME = 'auth/invalid-display-name',
	AUTH_INVALID_EMAIL_VERIFIED = 'auth/invalid-email-verified',
	AUTH_INVALID_HASH_ALGORITHM = 'auth/invalid-hash-algorithm',
	AUTH_INVALID_HASH_BLOCK_SIZE = 'auth/invalid-hash-block-size',
	AUTH_INVALID_HASH_DERIVED_KEY_LENGTH = 'auth/invalid-hash-derived-key-length',
	AUTH_INVALID_HASH_KEY = 'auth/invalid-hash-key',
	AUTH_INVALID_HASH_MEMORY_COST = 'auth/invalid-hash-memory-cost',
	AUTH_INVALID_HASH_PARALLELIZATION = 'auth/invalid-hash-parallelization',
	AUTH_INVALID_HASH_ROUNDS = 'auth/invalid-hash-rounds',
	AUTH_INVALID_HASH_SALT_SEPARATOR = 'auth/invalid-hash-salt-separator',
	AUTH_INVALID_ID_TOKEN = 'auth/invalid-id-token',
	AUTH_INVALID_LAST_SIGN_IN_TIME = 'auth/invalid-last-sign-in-time',
	AUTH_INVALID_PAGE_TOKEN = 'auth/invalid-page-token',
	AUTH_INVALID_PASSWORD_HASH = 'auth/invalid-password-hash',
	AUTH_INVALID_PASSWORD_SALT = 'auth/invalid-password-salt',
	AUTH_INVALID_PHOTO_URL = 'auth/invalid-photo-url',
	AUTH_INVALID_PROVIDER_DATA = 'auth/invalid-provider-data',
	AUTH_INVALID_SESSION_COOKIE_DURATION = 'auth/invalid-session-cookie-duration',
	AUTH_INVALID_TENANT_ID = 'auth/invalid-tenant-id',
	AUTH_MISSING_UID = 'auth/missing-uid',
	AUTH_MISSING_HASH_ALGORITHM = 'auth/missing-hash-algorithm',
	AUTH_MISSING_PASSWORD_HASH = 'auth/missing-password-hash',
	AUTH_MISSING_PASSWORD_SALT = 'auth/missing-password-salt',
	AUTH_RESERVED_CLAIMS = 'auth/reserved-claims',
	AUTH_SESSION_COOKIE_REVOKED = 'auth/session-cookie-revoked',
	AUTH_WEAK_PASSWORD = 'auth/weak-password',
	AUTH_ARGUMENT_ERROR = 'auth/argument-error',
	// Firebase Messaging errors
	MESSAGING_INVALID_ARGUMENT = 'messaging/invalid-argument',
	MESSAGING_INVALID_RECIPIENT = 'messaging/invalid-recipient',
	MESSAGING_INVALID_PAYLOAD = 'messaging/invalid-payload',
	MESSAGING_INVALID_OPTION = 'messaging/invalid-option',
	MESSAGING_INVALID_DATA = 'messaging/invalid-data',
	MESSAGING_MESSAGE_ID_NOT_FOUND = 'messaging/message-id-not-found',
	MESSAGING_INVALID_REGISTRATION_TOKEN = 'messaging/invalid-registration-token',
	MESSAGING_REGISTRATION_TOKEN_NOT_REGISTERED = 'messaging/registration-token-not-registered',
	MESSAGING_MISMATCHED_CREDENTIAL = 'messaging/mismatched-credential',
	MESSAGING_INVALID_PACKAGE_NAME = 'messaging/invalid-package-name',
	MESSAGING_DEVICE_MESSAGE_RATE_EXCEEDED = 'messaging/device-message-rate-exceeded',
	MESSAGING_TOPICS_MESSAGE_RATE_EXCEEDED = 'messaging/topics-message-rate-exceeded',
	MESSAGING_INVALID_APNS_CREDENTIAL = 'messaging/invalid-apns-credential',
	// Firebase Database errors
	DATABASE_INVALID_ARGUMENT = 'database/invalid-argument',
	DATABASE_INVALID_DATA = 'database/invalid-data',
	DATABASE_PERMISSION_DENIED = 'database/permission-denied',
	DATABASE_UNAVAILABLE = 'database/unavailable',
	// Firebase Storage errors
	STORAGE_BUCKET_NOT_FOUND = 'storage/bucket-not-found',
	STORAGE_OBJECT_NOT_FOUND = 'storage/object-not-found',
	STORAGE_BUCKET_NOT_CONFIGURED = 'storage/bucket-not-configured',
	STORAGE_PROJECT_NOT_FOUND = 'storage/project-not-found',
	STORAGE_OBJECT_FINALIZE_ERROR = 'storage/object-finalize-error',
	STORAGE_RESPONSE_ERROR = 'storage/response-error',
	// Firebase Firestore errors
	FIRESTORE_INVALID_ARGUMENT = 'firestore/invalid-argument',
	FIRESTORE_INVALID_DATA = 'firestore/invalid-data',
	FIRESTORE_PERMISSION_DENIED = 'firestore/permission-denied',
	FIRESTORE_NOT_FOUND = 'firestore/not-found',
	FIRESTORE_RESOURCE_EXHAUSTED = 'firestore/resource-exhausted',
	FIRESTORE_FAILED_PRECONDITION = 'firestore/failed-precondition',
	FIRESTORE_ABORTED = 'firestore/aborted',
	FIRESTORE_OUT_OF_RANGE = 'firestore/out-of-range',
	FIRESTORE_UNIMPLEMENTED = 'firestore/unimplemented',
	FIRESTORE_INTERNAL = 'firestore/internal',
	FIRESTORE_UNAVAILABLE = 'firestore/unavailable',
	FIRESTORE_DATA_LOSS = 'firestore/data-loss',
	FIRESTORE_UNAUTHENTICATED = 'firestore/unauthenticated',
}

export const FirebaseAdminErrorMessages: Record<FirebaseAdminErrors, string> = {
	[FirebaseAdminErrors.AUTH_EMAIL_ALREADY_EXISTS]:
		'The email address is already in use by another account.',
	[FirebaseAdminErrors.AUTH_PHONE_NUMBER_ALREADY_EXISTS]:
		'The phone number is already in use by another account.',
	[FirebaseAdminErrors.AUTH_PROJECT_NOT_FOUND]:
		'No Firebase project was found for the provided credential.',
	[FirebaseAdminErrors.AUTH_UID_ALREADY_EXISTS]:
		'The provided uid is already in use by an existing user.',
	[FirebaseAdminErrors.AUTH_USER_NOT_FOUND]:
		'There is no existing user record corresponding the provided identifier.',
	[FirebaseAdminErrors.AUTH_INSUFFICIENT_PERMISSION]:
		'Insufficient permissions to access the Firebase project.',
	[FirebaseAdminErrors.AUTH_INVALID_UID]: 'The provided uid is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_EMAIL]: 'The provided email is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_PHONE_NUMBER]:
		'The provided phone number is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_PASSWORD]:
		'The provided password is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_PROVIDER_ID]:
		'The provided provider id is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_CREDENTIAL]:
		'The provided credential is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_DISABLED_FIELD]:
		'The provided value for the disabled field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_DISPLAY_NAME]:
		'The provided value for the displayName field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_EMAIL_VERIFIED]:
		'The provided value for the emailVerified field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_HASH_ALGORITHM]:
		'The provided value for the hashAlgorithm field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_HASH_BLOCK_SIZE]:
		'The provided value for the hashBlockSize field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_HASH_DERIVED_KEY_LENGTH]:
		'The provided value for the hashDerivedKeyLength field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_HASH_KEY]:
		'The provided value for the hashKey field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_HASH_MEMORY_COST]:
		'The provided value for the hashMemoryCost field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_HASH_PARALLELIZATION]:
		'The provided value for the hashParallelization field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_HASH_ROUNDS]:
		'The provided value for the hashRounds field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_HASH_SALT_SEPARATOR]:
		'The provided value for the hashSaltSeparator field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_ID_TOKEN]:
		'The provided id token is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_LAST_SIGN_IN_TIME]:
		'The provided value for the lastSignInTime field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_PAGE_TOKEN]:
		'The provided next page token in listUsers() is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_PASSWORD_HASH]:
		'The password hash must be a valid string.',
	[FirebaseAdminErrors.AUTH_INVALID_PASSWORD_SALT]:
		'The password salt must be a valid string.',
	[FirebaseAdminErrors.AUTH_INVALID_PHOTO_URL]:
		'The provided value for the photoURL field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_PROVIDER_DATA]:
		'The provided value for the providerData field is invalid.',
	[FirebaseAdminErrors.AUTH_INVALID_SESSION_COOKIE_DURATION]:
		'The provided value for the sessionCookieDurationMillis field must be a valid number in milliseconds between 5 minutes and 2 weeks.',
	[FirebaseAdminErrors.AUTH_INVALID_TENANT_ID]: `The Auth instance's tenant ID must be a non-empty string.`,
	[FirebaseAdminErrors.AUTH_MISSING_UID]:
		'A uid identifier is required for the current operation.',
	[FirebaseAdminErrors.AUTH_MISSING_HASH_ALGORITHM]:
		'The hash algorithm must be provided for password imports.',
	[FirebaseAdminErrors.AUTH_MISSING_PASSWORD_HASH]:
		'The password hash must be provided for password imports.',
	[FirebaseAdminErrors.AUTH_MISSING_PASSWORD_SALT]:
		'The password salt must be provided for password imports.',
	[FirebaseAdminErrors.AUTH_RESERVED_CLAIMS]:
		'One or more custom user claims provided to setCustomUserClaims() are reserved.',
	[FirebaseAdminErrors.AUTH_SESSION_COOKIE_REVOKED]:
		'The session cookie has been revoked.',
	[FirebaseAdminErrors.AUTH_WEAK_PASSWORD]: 'The provided password is weak.',
	[FirebaseAdminErrors.MESSAGING_INVALID_ARGUMENT]: '',
	[FirebaseAdminErrors.MESSAGING_INVALID_RECIPIENT]: '',
	[FirebaseAdminErrors.MESSAGING_INVALID_PAYLOAD]: '',
	[FirebaseAdminErrors.MESSAGING_INVALID_OPTION]: '',
	[FirebaseAdminErrors.MESSAGING_INVALID_DATA]: '',
	[FirebaseAdminErrors.MESSAGING_MESSAGE_ID_NOT_FOUND]: '',
	[FirebaseAdminErrors.MESSAGING_INVALID_REGISTRATION_TOKEN]: '',
	[FirebaseAdminErrors.MESSAGING_REGISTRATION_TOKEN_NOT_REGISTERED]: '',
	[FirebaseAdminErrors.MESSAGING_MISMATCHED_CREDENTIAL]: '',
	[FirebaseAdminErrors.MESSAGING_INVALID_PACKAGE_NAME]: '',
	[FirebaseAdminErrors.MESSAGING_DEVICE_MESSAGE_RATE_EXCEEDED]: '',
	[FirebaseAdminErrors.MESSAGING_TOPICS_MESSAGE_RATE_EXCEEDED]: '',
	[FirebaseAdminErrors.MESSAGING_INVALID_APNS_CREDENTIAL]: '',
	[FirebaseAdminErrors.DATABASE_INVALID_ARGUMENT]: '',
	[FirebaseAdminErrors.DATABASE_INVALID_DATA]: '',
	[FirebaseAdminErrors.DATABASE_PERMISSION_DENIED]: '',
	[FirebaseAdminErrors.DATABASE_UNAVAILABLE]: '',
	[FirebaseAdminErrors.STORAGE_BUCKET_NOT_FOUND]: '',
	[FirebaseAdminErrors.STORAGE_OBJECT_NOT_FOUND]: '',
	[FirebaseAdminErrors.STORAGE_BUCKET_NOT_CONFIGURED]: '',
	[FirebaseAdminErrors.STORAGE_PROJECT_NOT_FOUND]: '',
	[FirebaseAdminErrors.STORAGE_OBJECT_FINALIZE_ERROR]: '',
	[FirebaseAdminErrors.STORAGE_RESPONSE_ERROR]: '',
	[FirebaseAdminErrors.FIRESTORE_INVALID_ARGUMENT]: '',
	[FirebaseAdminErrors.FIRESTORE_INVALID_DATA]: '',
	[FirebaseAdminErrors.FIRESTORE_PERMISSION_DENIED]: '',
	[FirebaseAdminErrors.FIRESTORE_NOT_FOUND]: '',
	[FirebaseAdminErrors.FIRESTORE_RESOURCE_EXHAUSTED]: '',
	[FirebaseAdminErrors.FIRESTORE_FAILED_PRECONDITION]: '',
	[FirebaseAdminErrors.FIRESTORE_ABORTED]: '',
	[FirebaseAdminErrors.FIRESTORE_OUT_OF_RANGE]: '',
	[FirebaseAdminErrors.FIRESTORE_UNIMPLEMENTED]: '',
	[FirebaseAdminErrors.FIRESTORE_INTERNAL]: '',
	[FirebaseAdminErrors.FIRESTORE_UNAVAILABLE]: '',
	[FirebaseAdminErrors.FIRESTORE_DATA_LOSS]: '',
	[FirebaseAdminErrors.FIRESTORE_UNAUTHENTICATED]: '',
	[FirebaseAdminErrors.AUTH_EXPIRED_TOKEN]: 'Invalid / expired token.',
	[FirebaseAdminErrors.AUTH_REVOKED_TOKEN]:
		'Token has been revoked. Please login again',
	[FirebaseAdminErrors.AUTH_ARGUMENT_ERROR]: 'The function argument is invalid',
};

export class FirebaseErrorMessageHelper {
	parseFirebaseError(error: FirebaseError | any): string {
		return FirebaseAdminErrorMessages[error.code] ?? error;
	}
}
