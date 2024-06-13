import { UserRoles } from '@app/common/config/config.constants';

export interface FirebaseUser {
	name: string;
	picture: string;
	iss: string;
	aud: string;
	auth_time: number;
	user_id: string;
	sub: string;
	iat: number;
	exp: number;
	email: string;
	email_verified: boolean;
	firebase: Record<string, any>;
	uid: string;
}

export interface ICreateFirebaseUser {
	displayName: string;
	email: string;
	emailVerified: boolean;
	password?: string;
	phoneNumber?: string;
	photoURL?: string | null;
}

export type FirebaseError = {
	code: string;
	message: string;
};

export enum AuthType {
	Bearer,
	None,
	ApiKey,
}

export interface ActiveUserData {
	email: string;
	systemRole: string;
	organizationRole?: string;
	organizationId?: string;
	uid?: string;
	entitlements: string[];
}
export interface RolesAndEntitlements {
	roles: UserRoles[];
	entitlements: string[];
}
