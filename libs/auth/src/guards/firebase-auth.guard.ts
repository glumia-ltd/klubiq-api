import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import {
	FirebaseAdminErrors,
	FirebaseAdminErrorMessages,
} from '../helpers/firebase-error-helper';
import { ErrorMessages } from '@app/common/config/error.constant';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private configService: ConfigService,
	) {}

	async canActivate(
		context: ExecutionContext,
	): Promise<boolean | Promise<boolean> | Observable<boolean> | any> {
		const request: any = context.switchToHttp().getRequest<Request>();
		if (!request.headers.authorization) {
			throw new Error(ErrorMessages.UNAUTHORIZED);
		}
		const fireUser = await this.validate(request.headers.authorization);
		if (!fireUser) {
			throw new Error(ErrorMessages.UNAUTHORIZED);
		}
		request.user = fireUser;
		return true;
	}

	public async validate(token: string) {
		let firebaseUser: any;
		if (this.configService.get('LOCAL_USER') === 'true') return firebaseUser;
		const jwtToken = token.split('Bearer ')[1];
		if (!jwtToken) {
			throw new Error(ErrorMessages.UNAUTHORIZED);
		}
		try {
			firebaseUser = await this.authService.auth.verifyIdToken(jwtToken, true);
			return firebaseUser;
		} catch (err) {
			if (err.code == FirebaseAdminErrors.AUTH_REVOKED_TOKEN)
				throw new Error(
					FirebaseAdminErrorMessages[FirebaseAdminErrors.AUTH_REVOKED_TOKEN],
				);
			else if (err.code == FirebaseAdminErrors.AUTH_EXPIRED_TOKEN)
				throw new Error(
					FirebaseAdminErrorMessages[FirebaseAdminErrors.AUTH_EXPIRED_TOKEN],
				);
			else {
				const message = FirebaseAdminErrorMessages[err.code];
				throw new Error(message ?? err.message);
			}
		}
	}
}
