import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredPermissions = this.reflector.get<string[]>(
			'permissions',
			context.getHandler(),
		);
		if (!requiredPermissions) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const user: UserProfile = request.user;
		if (!user || !user.roles) {
			return false;
		}
		// TODO: COMMENTED OUT FOR FURTHER DISCUSSION
		// const hasPermission = user.roles.some(role => {
		//   return role.permissions.some(permission => requiredPermissions.includes(permission.permissionName));
		// });
		return true;
	}
}
