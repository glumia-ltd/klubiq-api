import { SetMetadata } from '@nestjs/common';

export const Permissions = (...permissions: string[]) =>
	SetMetadata('permissions', permissions);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
