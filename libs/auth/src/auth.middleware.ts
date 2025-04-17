import {
	Injectable,
	NestMiddleware,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminAuthService } from './services/admin-auth.service';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		private readonly authService: AdminAuthService,
		private readonly configService: ConfigService,
	) {}
	async use(req: any, res: any, next: () => void) {
		const isLocal = this.configService.get<string>('NODE_ENV') === 'local';
		const clientId = req.headers['x-client-id'];
		if (!clientId && !isLocal) {
			throw new UnauthorizedException('Client id is required');
		}
		const appCheckClients = this.configService
			.get<string>('KLUBIQ_API_APPCHECK_CLIENTS')
			.split('|');
		const isAppCheckClient = appCheckClients.indexOf(clientId) !== -1;
		if (!isAppCheckClient && !isLocal) {
			throw new UnauthorizedException(
				'Client is not authorized to access this route',
			);
		}
		next();
		// try {
		//   const { token, appId } = await this.authService.getAppCheckToken();
		// 	const decodedToken = await this.authService.verifyAppCheckToken(token);
		//   console.log('decodedToken', decodedToken);
		// 	if (!token && !appId) {
		// 		throw new UnauthorizedException('No app check token found');
		// 	}
		//   req.headers['x-firebase-gmpid'] = appId;
		//   req.headers['x-firebase-appcheck'] = token;
		// 	next();
		// } catch (error) {
		// 	throw new UnauthorizedException('App check token is invalid');
		// }
	}
}
