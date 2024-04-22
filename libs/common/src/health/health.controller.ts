import { Auth, AuthType } from '@app/auth';
import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
	HealthCheckService,
	HttpHealthIndicator,
	HealthCheck,
	TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthService } from './health.service';

@Auth(AuthType.None)
@ApiTags('health')
@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private http: HttpHealthIndicator,
		private configService: ConfigService,
		private db: TypeOrmHealthIndicator,
		private healthService: HealthService,
	) {}

	@Get()
	@HealthCheck()
	check(@Query('version') version: string, @Query('appName') appName: string) {
		return this.health.check([
			() => this.healthService.isHealthy(appName, appName, version),
			() => this.db.pingCheck('database'),
		]);
	}
}
