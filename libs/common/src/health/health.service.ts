import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	HealthIndicator,
	HealthIndicatorResult,
	HealthCheckError,
} from '@nestjs/terminus';

export interface AppData {
	appVersion: string;
	name: string;
}
@Injectable()
export class HealthService extends HealthIndicator {
	constructor(private readonly configService: ConfigService) {
		super();
	}

	async isHealthy(
		key: string,
		appName?: string,
		appVersion?: string,
	): Promise<HealthIndicatorResult> {
		const app: AppData = {
			appVersion: this.configService.get('APP_VERSION'),
			name: this.configService.get('APP_NAME'),
		};
		const isHealthy = app.appVersion == appVersion || app.name == appName;

		const result = this.getStatus(key, isHealthy);
		if (!isHealthy) {
			throw new HealthCheckError('Health check failed', result);
		}
		return result;
	}
}
