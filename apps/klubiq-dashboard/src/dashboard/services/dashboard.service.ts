import { ErrorMessages } from '@app/common/config/error.constant';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
	IPropertyMetrics,
	PROPERTY_METRICS,
} from '../../properties/services/interfaces/property-metrics.service.interface';
import { DashboardMetrics } from '../dto/responses/dashboard-metrics.dto';
import { PropertyMetrics } from '@app/common/dto/responses/property-metrics.dto';

@Injectable()
export class DashboardService {
	private readonly logger = new Logger(DashboardService.name);
	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		@Inject(PROPERTY_METRICS)
		private readonly propertyMetrics: IPropertyMetrics,
	) {}
	async getMetrics(): Promise<DashboardMetrics> {
		this.logger.log('getMetrics');
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		const propertyMetrics: PropertyMetrics =
			await this.propertyMetrics.getPropertyMetricsByOrganization(
				currentUser.organizationId,
			);
		const metrics = { propertyMetrics } as DashboardMetrics;
		return metrics;
	}
}
