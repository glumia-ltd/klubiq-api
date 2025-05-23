import { SetMetadata } from '@nestjs/common';
import {
	UserRoles,
	AppFeature,
	Permissions,
} from '@app/common/config/config.constants';
import { AuthType } from '../types/firebase.types';

export const FEATURES_KEY = 'features';
export const Feature = (feature: AppFeature) =>
	SetMetadata(FEATURES_KEY, feature);

export const PERMISSIONS_KEY = 'permissions';
export const Permission = (...permissions: Permissions[]) =>
	SetMetadata(PERMISSIONS_KEY, permissions);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const AUTH_TYPE_KEY = 'authType';
export const Auth = (...authTypes: AuthType[]) =>
	SetMetadata(AUTH_TYPE_KEY, authTypes);
