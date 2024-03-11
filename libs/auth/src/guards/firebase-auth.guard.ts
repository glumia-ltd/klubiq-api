import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseAuthenticationService } from '@aginix/nestjs-firebase-admin';
import { UsersService } from 'apps/klubiq-dashboard/src/users/users.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private usersService: UsersService,
		private firebaseAuth: FirebaseAuthenticationService,
		private configService: ConfigService,
	) {}

	async canActivate(
		context: ExecutionContext,
	): Promise<boolean | Promise<boolean> | Observable<boolean> | any> {
		const request: any = context.switchToHttp().getRequest<Request>();
		try {
			const fireUser = await this.validate(request.headers.authorization);
			const user = await this.usersService.getUserByFireBaseId(fireUser.uid);

			if (!user) {
				request.user = { firebaseId: fireUser.uid, new: true };
				return true;
			}

			request.user = user;
		} catch (validationError) {
			return false;
		}
	}

	public async validate(token: string) {
		let firebaseUser: any = FirebaseUserMock;
		if (this.configService.get('LOCAL_USER') === 'true') return firebaseUser;
		const jwtToken = token.split('Bearer ')[1];
		if (!jwtToken) {
			throw new ForbiddenException(
				'Invalid / expired token. Please login again',
			);
		}
		try {
			firebaseUser = await this.firebaseAuth.auth.verifyIdToken(jwtToken);
			return firebaseUser;
		} catch (err) {
			console.log('err', err);
			throw new ForbiddenException(
				'Invalid / expired token. Please login again',
			);
		}
	}
}
