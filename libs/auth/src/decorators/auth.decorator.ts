import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '@app/common';
import { AuthType } from '../types/firebase.types';

export const Permissions = (...permissions: string[]) =>
	SetMetadata('permissions', permissions);

export const Roles = (...roles: UserRoles[]) => SetMetadata('roles', roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const AUTH_TYPE_KEY = 'authType';
export const Auth = (...authTypes: AuthType[]) =>
	SetMetadata(AUTH_TYPE_KEY, authTypes);
