import {
	Injectable,
	NestMiddleware,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly configService: ConfigService) {}
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
	}
}
