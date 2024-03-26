import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<string[]>(
			'roles',
			context.getHandler(),
		);
		if (!requiredRoles) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const user: UserProfile = request.user;
		if (!user || !user.roles) {
			return false;
		}
		const hasRole = user.roles.some((role) =>
			requiredRoles.includes(role.name),
		);
		return hasRole;
	}
}
