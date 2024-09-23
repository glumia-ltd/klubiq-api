import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonConfigService {
	private readonly appEnvironment: string;
	constructor(private readonly configService: ConfigService) {
		this.appEnvironment = this.configService.get<string>('NODE_ENV');
	}

	// gets all app features
	isDevelopmentEnvironment(): boolean {
		return ['local', 'test', 'development', 'staging', 'dev'].includes(
			this.appEnvironment,
		);
	}
}
