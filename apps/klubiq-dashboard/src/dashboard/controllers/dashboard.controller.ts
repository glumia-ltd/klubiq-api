import { BadRequestException, Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { UserRoles } from '@app/common/config/config.constants';
import { DashboardMetrics } from '../dto/responses/dashboard-metrics.dto';
import { Auth, Roles } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';

@ApiBearerAuth()
@ApiTags('dashboard')
@Controller('dashboard')
@Auth(AuthType.Bearer)
@Roles(UserRoles.LANDLORD)
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Roles(UserRoles.ORG_OWNER)
	@Get('metrics')
	@ApiOkResponse({ type: DashboardMetrics })
	async metrics(): Promise<DashboardMetrics> {
		try {
			const data = await this.dashboardService.getMetrics();
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
