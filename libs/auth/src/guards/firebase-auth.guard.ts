import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'apps/klubiq-dashboard/src/users/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private usersService: UsersService,
		private configService: ConfigService,
	) {}

	async canActivate(
		context: ExecutionContext,
	): Promise<boolean | Promise<boolean> | Observable<boolean> | any> {
		const request: any = context.switchToHttp().getRequest<Request>();
		try {
			const fireUser = await this.validate(request.headers.authorization);
			const user = await this.usersService.getUserByFireBaseId(fireUser.uid);

			request.user = user;

			return true;
		} catch (validationError) {
			return false;
		}
	}

	public async validate(token: string) {
		let firebaseUser: any;
		if (this.configService.get('LOCAL_USER') === 'true') return firebaseUser;
		const jwtToken = token.split('Bearer ')[1];
		if (!jwtToken) {
			throw new ForbiddenException(
				'Invalid / expired token. Please login again',
			);
		}
		try {
			firebaseUser = await this.authService.auth.verifyIdToken(jwtToken);
			console.log('firebaseUser', firebaseUser);
			return firebaseUser;
		} catch (err) {
			console.log('err', err);
			throw new ForbiddenException(
				'Invalid / expired token. Please login again',
			);
		}
	}
}
