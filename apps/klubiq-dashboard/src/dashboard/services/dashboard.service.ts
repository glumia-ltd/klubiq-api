import { ErrorMessages } from '@app/common/config/error.constant';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
	IPropertyMetrics,
	PROPERTY_METRICS,
} from '../../properties/interfaces/property-metrics.service.interface';
import { PropertyMetrics } from '@app/common/dto/responses/property-metrics.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKeys } from '@app/common';

@Injectable()
export class DashboardService {
	private readonly logger = new Logger(DashboardService.name);
	private readonly cacheTTL = 60000;
	private readonly cacheKeyPrefix = 'dashboard';
	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		@Inject(PROPERTY_METRICS)
		private readonly propertyMetrics: IPropertyMetrics,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}
	async getPropertyMetrics(): Promise<PropertyMetrics> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		const cacheKey = `${this.cacheKeyPrefix}}/${CacheKeys.PROPERTY_METRICS}/${currentUser.organizationId}`;
		const cachedPropertyMetrics =
			await this.cacheManager.get<PropertyMetrics>(cacheKey);
		if (cachedPropertyMetrics) {
			this.logger.log('Retrieving property metrics from cache');
			return cachedPropertyMetrics;
		}
		const propertyMetrics: PropertyMetrics =
			await this.propertyMetrics.getPropertyMetricsByOrganization(
				currentUser.organizationId,
				30,
			);
		await this.cacheManager.set(cacheKey, cachedPropertyMetrics, this.cacheTTL);
		return propertyMetrics;
	}
}
