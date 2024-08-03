import { ErrorMessages } from '@app/common/config/error.constant';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
	IPropertyMetrics,
	PROPERTY_METRICS,
} from '../../properties/interfaces/property-metrics.service.interface';
import {
	PropertyMetrics,
	RevenueResponseDto,
	TransactionMetricsDto,
} from '@app/common/dto/responses/dashboard-metrics.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKeys } from '@app/common';
import { DashboardRepository } from '../repositories/dashboard.repository';

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
		private readonly dashboardRepository: DashboardRepository,
	) {}
	async getPropertyMetrics(): Promise<PropertyMetrics> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		const cacheKey = `${this.cacheKeyPrefix}/${CacheKeys.PROPERTY_METRICS}/${currentUser.organizationId}`;
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
		await this.cacheManager.set(cacheKey, propertyMetrics, this.cacheTTL);
		return propertyMetrics;
	}

	async getRevenueBarChartData(): Promise<RevenueResponseDto> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		const cacheKey = `${this.cacheKeyPrefix}/${CacheKeys.REVENUE_METRICS}/${currentUser.organizationId}`;
		const cachedRevenueMetrics =
			await this.cacheManager.get<RevenueResponseDto>(cacheKey);
		if (cachedRevenueMetrics) {
			this.logger.log('Retrieving revenue metrics from cache');
			return cachedRevenueMetrics;
		}
		const result = await this.dashboardRepository.getMonthlyRevenueData(
			currentUser.organizationId,
		);
		await this.cacheManager.set(cacheKey, result, this.cacheTTL);
		return result;
	}

	async getTransactionMetricsData(): Promise<TransactionMetricsDto> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		const cacheKey = `${this.cacheKeyPrefix}/${CacheKeys.TRANSACTION_METRICS}/${currentUser.organizationId}`;
		const cachedTransactionMetrics =
			await this.cacheManager.get<TransactionMetricsDto>(cacheKey);
		if (cachedTransactionMetrics) {
			this.logger.log('Retrieving transaction metrics from cache');
			return cachedTransactionMetrics;
		}
		const result = await this.dashboardRepository.getTransactionMetricsData(
			currentUser.organizationId,
		);
		await this.cacheManager.set(cacheKey, result, this.cacheTTL);
		return result;
	}
}
