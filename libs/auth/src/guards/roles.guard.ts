import { UserRoles } from '@app/common';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.get<UserRoles[]>(
			'roles',
			context.getHandler(),
		);

		if (!requiredRoles) {
			return true; // No roles required, allow access
		}

		const request = context.switchToHttp().getRequest();
		const token = request.headers.authorization?.split(' ')[1];
		if (!token) {
			return false; // No token provided, deny access
		}

		const userRoles = await this.authService.getUserRolesFromToken(token);

		const hasRequiredRole = requiredRoles.some((role) =>
			userRoles.includes(role),
		);

		return hasRequiredRole;
	}
}
