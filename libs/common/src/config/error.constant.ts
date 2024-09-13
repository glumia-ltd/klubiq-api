export enum ErrorMessages {
	UNAUTHORIZED = 'Unauthorized Access',
	INTERNAL_SERVER_ERROR = 'Internal Server Error',
	NOT_FOUND = 'Not Found',
	BAD_REQUEST = 'Bad Request',
	CONFLICT = 'Conflict',
	TOKEN_EXPIRED = 'Invalid / expired token.',
	TOKEN_REVOKED = 'Token has been revoked. Please login again',
	FORBIDDEN = 'You do not have the necessary permissions to perform this action.',
	USER_NOT_CREATED = 'User not created',
	NO_ORG_CREATE_PROPERTY = 'Creating a property without an Organization is not allowed',
	PROPERTY_LIMIT_REACHED = 'Property limit reached for your current subscription',
}
