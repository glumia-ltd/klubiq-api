import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import {
	Actions,
	AppFeature,
	UserRoles,
} from '@app/common/config/config.constants';
import {
	Ability,
	Auth,
	Feature,
	Roles,
} from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';
import {
	DashboardMetricsDto,
	RevenueResponseDto,
} from '@app/common/dto/responses/dashboard-metrics.dto';

@ApiBearerAuth()
@ApiTags('dashboard')
@Controller('dashboard')
@Auth(AuthType.Bearer)
@Feature(AppFeature.SETTING)
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Roles(UserRoles.ORG_OWNER, UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
	@Ability(Actions.WRITE, Actions.VIEW)
	@Get('metrics')
	@ApiOkResponse()
	async metrics(): Promise<DashboardMetricsDto> {
		try {
			const data: DashboardMetricsDto = {
				propertyMetrics: await this.dashboardService.getPropertyMetrics(),
				revenueMetrics: await this.dashboardService.getRevenueBarChartData(),
				transactionMetrics:
					await this.dashboardService.getTransactionMetricsData(),
			};
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(UserRoles.ORG_OWNER, UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
	@Ability(Actions.WRITE, Actions.VIEW)
	@Get('revenue-report')
	@ApiOkResponse()
	async getRevenueReport(
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
	): Promise<RevenueResponseDto> {
		try {
			const data: RevenueResponseDto =
				await this.dashboardService.getRevenueBarChartData(startDate, endDate);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
