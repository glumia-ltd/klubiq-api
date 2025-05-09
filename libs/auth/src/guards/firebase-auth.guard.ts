import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
	FirebaseAdminErrors,
	FirebaseAdminErrorMessages,
} from '../helpers/firebase-error-helper';
import { ErrorMessages } from '@app/common/config/error.constant';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { ClsService } from 'nestjs-cls';
import { LandlordAuthService } from '../services/landlord-auth.service';
import { Request } from 'express';
import {
	extractAccessToken,
	extractRefreshToken,
} from '../helpers/cookie-helper';
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
	constructor(
		private authService: LandlordAuthService,
		private readonly cls: ClsService<SharedClsStore>,
	) {}

	async canActivate(
		context: ExecutionContext,
	): Promise<boolean | Promise<boolean> | Observable<boolean> | any> {
		const request: any = context.switchToHttp().getRequest<Request>();
		const authHeader = request.headers.authorization;
		const cookieToken: string | undefined = extractAccessToken(request);
		const refreshToken: string | undefined = extractRefreshToken(request);
		let rawToken: string | undefined;
		if (authHeader && authHeader.startsWith('Bearer ')) {
			rawToken = authHeader.split(' ')[1];
		} else if (cookieToken) {
			rawToken = cookieToken;
		}

		if (!rawToken && refreshToken) {
			throw new Error(
				FirebaseAdminErrorMessages[FirebaseAdminErrors.AUTH_EXPIRED_TOKEN],
			);
		}
		if (!rawToken) {
			throw new Error(ErrorMessages.UNAUTHORIZED);
		}
		const fireUser = await this.validate(rawToken);
		if (!fireUser) {
			throw new Error(ErrorMessages.UNAUTHORIZED);
		}
		request.user = fireUser;
		this.cls.set('currentUser', fireUser);
		return true;
	}

	public async validate(token: string) {
		let firebaseUser: any;
		try {
			firebaseUser = await this.authService.auth.verifyIdToken(token, true);
			return firebaseUser;
		} catch (err) {
			if (err.code == FirebaseAdminErrors.AUTH_REVOKED_TOKEN) {
				throw new Error(
					FirebaseAdminErrorMessages[FirebaseAdminErrors.AUTH_REVOKED_TOKEN],
				);
			} else if (err.code == FirebaseAdminErrors.AUTH_EXPIRED_TOKEN) {
				throw new Error(
					FirebaseAdminErrorMessages[FirebaseAdminErrors.AUTH_EXPIRED_TOKEN],
				);
			} else {
				const message = FirebaseAdminErrorMessages[err.code];
				throw new Error(message ?? err.message);
			}
		}
	}
}
