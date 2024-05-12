import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ApikeyGuard } from './apikey.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
	private static readonly defaultAuthType = AuthType.Bearer;
	private readonly authTypeGuardMap: Record<
		AuthType,
		CanActivate | CanActivate[]
	> = {
		[AuthType.Bearer]: this.firebaseAuthGuard,
		[AuthType.None]: { canActivate: () => true },
		[AuthType.ApiKey]: this.apiKeyGuard,
	};
	constructor(
		private readonly reflector: Reflector,
		private readonly firebaseAuthGuard: FirebaseAuthGuard,
		private readonly apiKeyGuard: ApikeyGuard,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
			AUTH_TYPE_KEY,
			[context.getHandler(), context.getClass()],
		) ?? [AuthenticationGuard.defaultAuthType];
		const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
		try {
			for (const instance of guards) {
				const canActivate = await Promise.resolve(
					instance.canActivate(context),
				);
				return !!canActivate;
			}
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.UNAUTHORIZED, {
				cause: error.stack,
			});
		}
	}
}
