import { ErrorMessages } from '@app/common/config/error.constant';
import { UserRoles } from '@app/common/config/config.constants';
import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
//import { AuthService } from '../services/auth.service';
import { LandlordAuthService } from '../services/landlord-auth.service';
import { ROLES_KEY } from '../decorators/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: LandlordAuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.get<UserRoles[]>(
			ROLES_KEY,
			context.getHandler(),
		);

		if (!requiredRoles) {
			return true; // No roles required, allow access
		}

		const request = context.switchToHttp().getRequest();
		const token = request.headers.authorization?.split(' ')[1];
		if (!token) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN); // No token provided, deny access
		}

		const userRoles = await this.authService.getUserRolesFromToken(token);

		const hasRequiredRole = requiredRoles.some((role) =>
			userRoles.roles.includes(role),
		);

		return hasRequiredRole;
	}
}
