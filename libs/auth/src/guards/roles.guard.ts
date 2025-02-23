//import { ErrorMessages } from '@app/common/config/error.constant';
import { Permissions, AppFeature } from '@app/common/config/config.constants';
import {
	Injectable,
	CanActivate,
	ExecutionContext,
	//ForbiddenException,
	Logger,
	Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessControlService } from '../services/access-control.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FEATURES_KEY, PERMISSIONS_KEY } from '../decorators/auth.decorator';
import { ActiveUserData } from '../types/firebase.types';

@Injectable()
export class RolesGuard implements CanActivate {
	private readonly logger = new Logger(RolesGuard.name);
	constructor(
		private reflector: Reflector,
		private accessControlService: AccessControlService,
		@Inject(REQUEST) private readonly request: Request,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const feature = this.reflector.get<AppFeature>(
			FEATURES_KEY,
			context.getClass(),
		);
		const requiredPermissions = this.reflector.get<Permissions[]>(
			PERMISSIONS_KEY,
			context.getHandler(),
		);

		if (!requiredPermissions || !feature) {
			return true; // No specific permissions or feature required, allow access.
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user as ActiveUserData;
		if (!user || !user.kUid || !user.organizationId) {
			// Check that both are present.
			this.logger.warn(
				'No user or organization ID found in Firebase claims, denying access.',
			);
			return false; // No user or organization authenticated, deny access.
		}
		const userUuid = user.kUid;
		const organizationUuid = user.organizationId;
		// Check if the user has *all* the required permissions for the feature.
		for (const permission of requiredPermissions) {
			try {
				const hasPermission = await this.accessControlService.hasPermission(
					userUuid,
					organizationUuid,
					feature,
					permission,
				);
				if (!hasPermission) {
					this.logger.warn(
						`User ${userUuid} lacks permission ${permission} for feature ${feature}`,
					);
					return false; // User lacks at least one required permission.
				}
			} catch (error) {
				this.logger.error(
					`Error checking permission: ${error.message}`,
					error.stack,
				);
				return false; // Handle the error appropriately (e.g., deny access).
			}
		}

		return true; // User has all required permissions, allow access.
	}
}
