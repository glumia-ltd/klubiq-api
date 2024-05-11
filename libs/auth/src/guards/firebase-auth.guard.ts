import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { FirebaseErrors } from '../helpers/firebase-error-helper';

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
		try {
			const fireUser = await this.validate(request.headers.authorization);
			if (!fireUser) throw new UnauthorizedException();

			request.user = fireUser;
			return true;
		} catch {
			throw new UnauthorizedException();
		}
	}

	public async validate(token: string) {
		let firebaseUser: any;
		if (this.configService.get('LOCAL_USER') === 'true') return firebaseUser;
		const jwtToken = token.split('Bearer ')[1];
		if (!jwtToken) {
			throw new UnauthorizedException('Unauthorized access');
		}
		try {
			firebaseUser = await this.authService.auth.verifyIdToken(jwtToken, true);
			return firebaseUser;
		} catch (err) {
			if (err.code == FirebaseErrors.TOKEN_REVOKED)
				throw new HttpException(
					{
						status: HttpStatus.UNAUTHORIZED,
						error: 'Token has been revoked. Please login again',
					},
					HttpStatus.UNAUTHORIZED,
					{
						cause: new Error('Token has been revoked. Please login again'),
					},
				);
			else
				throw new HttpException(
					{
						status: HttpStatus.UNAUTHORIZED,
						error: 'Invalid / expired token.',
					},
					HttpStatus.UNAUTHORIZED,
					{
						cause: new Error('Invalid / expired token'),
					},
				);
		}
	}
}
