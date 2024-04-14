import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
	HealthCheckService,
	HttpHealthIndicator,
	HealthCheck,
	TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('healthcheck')
@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private http: HttpHealthIndicator,
		private configService: ConfigService,
		private db: TypeOrmHealthIndicator,
	) {}

	@Get('liveness')
	@HealthCheck()
	check() {
		return this.health.check([
			() =>
				this.http.pingCheck(
					'klubiq-api',
					`${this.configService.get('HEALTH_CHECK_URL')}/status`,
				),
		]);
	}

	@Get('readiness')
	@HealthCheck()
	check2() {
		return this.health.check([() => this.db.pingCheck('database')]);
	}
	@Get('status')
	status() {
		return true;
	}
}
