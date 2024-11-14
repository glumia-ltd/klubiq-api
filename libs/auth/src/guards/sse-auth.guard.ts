import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LandlordAuthService } from '../services/landlord-auth.service';
import { ClsService } from 'nestjs-cls';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';

@Injectable()
export class SSEAuthGuard implements CanActivate {
	constructor(
		private authService: LandlordAuthService,
		private readonly cls: ClsService<SharedClsStore>,
	) {}
	async canActivate(
		context: ExecutionContext,
	): Promise<boolean | Promise<boolean> | Observable<boolean> | any> {
		const request = context.switchToHttp().getRequest();
		const token = request.query.token;
		if (!token) throw new Error('Invalid token');
		try {
			const firebaseUser = await this.authService.auth.verifyIdToken(
				token,
				true,
			);
			request.user = firebaseUser;
			this.cls.set('currentUser', firebaseUser as any);
			return true;
		} catch {
			throw new Error('Invalid auth token');
		}
	}
}
