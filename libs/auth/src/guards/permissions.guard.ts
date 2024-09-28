import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
	Actions,
	AppFeature,
	UserRoles,
} from '@app/common/config/config.constants';
import { LandlordAuthService } from '../services/landlord-auth.service';
import {
	FEATURES_KEY,
	ABILITY_KEY,
	ROLES_KEY,
} from '../decorators/auth.decorator';
import { ErrorMessages } from '@app/common/config/error.constant';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: LandlordAuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const feature = this.reflector.get<AppFeature>(
			FEATURES_KEY,
			context.getClass(),
		);
		const requiredPermissions = this.reflector.get<Actions[]>(
			ABILITY_KEY,
			context.getHandler(),
		);
		const overridePermissionRoles = this.reflector.get<UserRoles[]>(
			ROLES_KEY,
			context.getHandler(),
		);

		if (!requiredPermissions) {
			return true; // No permissions required, allow access
		}

		const request = context.switchToHttp().getRequest();
		const token = request.headers.authorization?.split(' ')[1];
		if (!token) {
			throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED); // No token provided, deny access
		}
		const roleAndEntitlements =
			await this.authService.getUserRolesFromToken(token);
		if (
			!!overridePermissionRoles &&
			overridePermissionRoles.some((role) =>
				roleAndEntitlements.roles.includes(role),
			)
		) {
			return true;
		}
		const hasRequiredPermission = requiredPermissions.some((permission) =>
			roleAndEntitlements.entitlements.includes(`${feature}:${permission}`),
		);
		return hasRequiredPermission;
	}
}
