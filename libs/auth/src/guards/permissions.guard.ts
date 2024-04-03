import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { FeaturePermissions } from '@app/common';
import { ActiveUserData } from '../types/firebase.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const requiredPermissions = this.reflector.getAllAndOverride<
			FeaturePermissions[]
		>('permissions', [context.getHandler(), context.getClass()]);
		if (!requiredPermissions) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const user: ActiveUserData = request.user;
		return requiredPermissions.every((permission) =>
			user.permissions?.includes(permission),
		);
	}
}
