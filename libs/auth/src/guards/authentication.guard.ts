import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
	private static readonly defaultAuthType = AuthType.Bearer;
	private readonly authTypeGuardMap: Record<
		AuthType,
		CanActivate | CanActivate[]
	> = {
		[AuthType.Bearer]: this.firebaseAuthGuard,
		[AuthType.None]: { canActivate: () => true },
	};
	constructor(
		private readonly reflector: Reflector,
		private readonly firebaseAuthGuard: FirebaseAuthGuard,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
			AUTH_TYPE_KEY,
			[context.getHandler(), context.getClass()],
		) ?? [AuthenticationGuard.defaultAuthType];
		const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
		let error = new UnauthorizedException();

		for (const instance of guards) {
			const canActivate = await Promise.resolve(
				instance.canActivate(context),
			).catch((err) => {
				error = err;
			});
			return !!canActivate;
		}
		throw error;
	}
}
