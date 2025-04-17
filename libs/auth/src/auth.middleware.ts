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
		const clientId = req.headers['x-client-id'];
		if (!clientId) {
			throw new UnauthorizedException('Client id is required');
		}
		const { token } = await this.authService.getAppCheckToken();
		const appCheckClients = this.configService
			.get<string>('KLUBIQ_API_APPCHECK_CLIENTS')
			.split('|');
		const isAppCheckClient = appCheckClients.indexOf(clientId) !== -1;
		if (!isAppCheckClient) {
			throw new UnauthorizedException(
				'Client is not authorized to access this route',
			);
		}
		try {
			const decodedToken = await this.authService.verifyAppCheckToken(token);
			if (!decodedToken) {
				throw new UnauthorizedException('App check token is invalid');
			}
			next();
		} catch (error) {
			throw new UnauthorizedException('App check token is invalid');
		}
	}
}
