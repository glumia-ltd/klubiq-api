import { ErrorMessages } from '@app/common/config/error.constant';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
	IPropertyMetrics,
	PROPERTY_METRICS,
} from '../../properties/interfaces/property-metrics.service.interface';
import {
	LeaseMetricsDto,
	PropertyMetrics,
	RentOverdueLeaseDto,
	RevenueResponseDto,
	TransactionMetricsDto,
} from '@app/common/dto/responses/dashboard-metrics.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKeys } from '@app/common/config/config.constants';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { DateTime } from 'luxon';
import { FileDownloadService } from '@app/common/services/file-download.service';
import { Util } from '@app/common/helpers/util';
import {
	ILeaseService,
	LEASE_SERVICE_INTERFACE,
} from '../../lease/interfaces/lease.interface';

@Injectable()
export class DashboardService {
	private readonly logger = new Logger(DashboardService.name);
	private readonly cacheTTL = 3600;
	private readonly cacheKeyPrefix = 'dashboard';
	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		@Inject(PROPERTY_METRICS)
		private readonly propertyMetrics: IPropertyMetrics,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private readonly dashboardRepository: DashboardRepository,
		private readonly fileDownloadService: FileDownloadService,
		private readonly util: Util,
		@Inject(LEASE_SERVICE_INTERFACE)
		private readonly leaseService: ILeaseService,
	) {}

	private async updateOrgCacheKeys(cacheKey: string, listKeyName: string) {
		const listKeys = (await this.cacheManager.get<string[]>(listKeyName)) || [];
		await this.cacheManager.set(
			listKeyName,
			[...listKeys, cacheKey],
			this.cacheTTL,
		);
	}
	async getPropertyMetrics(
		invalidateCache: boolean = false,
	): Promise<PropertyMetrics> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);

		const cacheKey = `${this.cacheKeyPrefix}/${CacheKeys.PROPERTY_METRICS}/${currentUser.organizationId}`;
		if (invalidateCache) {
			await this.cacheManager.del(cacheKey);
		}
		const cachedPropertyMetrics =
			await this.cacheManager.get<PropertyMetrics>(cacheKey);
		if (cachedPropertyMetrics) {
			return cachedPropertyMetrics;
		}
		const propertyMetrics: PropertyMetrics =
			await this.propertyMetrics.getPropertyMetricsByOrganization(
				currentUser.organizationId,
				30,
			);
		await this.cacheManager.set(cacheKey, propertyMetrics, this.cacheTTL);
		this.updateOrgCacheKeys(
			cacheKey,
			`${currentUser.organizationId}/getPropertyListKeys`,
		);
		return propertyMetrics;
	}

	async getRevenueBarChartData(
		startDateStr?: string,
		endDateStr?: string,
	): Promise<RevenueResponseDto> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		const cacheKey = `${this.cacheKeyPrefix}/${CacheKeys.REVENUE_METRICS}/${startDateStr}to${endDateStr}/${currentUser.organizationId}`;
		const cachedRevenueMetrics =
			await this.cacheManager.get<RevenueResponseDto>(cacheKey);
		if (cachedRevenueMetrics) {
			this.logger.log('Retrieving revenue metrics from cache');
			return cachedRevenueMetrics;
		}
		const startDate = startDateStr
			? DateTime.fromISO(startDateStr).toSQL({ includeOffset: false })
			: null;
		const endDate = endDateStr
			? DateTime.fromISO(endDateStr).toSQL({ includeOffset: false })
			: null;
		const result = await this.dashboardRepository.getMonthlyRevenueData(
			currentUser.organizationId,
			startDate,
			endDate,
		);
		await this.cacheManager.set(cacheKey, result, this.cacheTTL);
		this.updateOrgCacheKeys(
			cacheKey,
			`${currentUser.organizationId}/transactionListKeys`,
		);
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
		this.updateOrgCacheKeys(
			cacheKey,
			`${currentUser.organizationId}/transactionListKeys`,
		);
		return result;
	}

	async getRevenueDataForDownload(
		startDateStr: string,
		endDateStr: string,
	): Promise<Buffer> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);

			const startDate = DateTime.fromISO(startDateStr).toSQL({
				includeOffset: false,
			});
			const endDate = DateTime.fromISO(endDateStr).toSQL({
				includeOffset: false,
			});

			const result = await this.dashboardRepository.getRevenueDataForDownload(
				currentUser.organizationId,
				startDate,
				endDate,
			);
			const buffer = await this.fileDownloadService.generateExcelFile(
				result,
				'Revenue Data',
			);

			return buffer;
		} catch (error) {
			// Handle the error appropriately
			console.error('Error occurred while generating revenue data:', error);
			throw error;
		}
	}

	async getLeaseMetricsData(): Promise<LeaseMetricsDto> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		const cacheKey = `${this.cacheKeyPrefix}/${CacheKeys.LEASE_METRICS}/${currentUser.organizationId}`;
		const cachedLeaseMetrics =
			await this.cacheManager.get<LeaseMetricsDto>(cacheKey);
		if (cachedLeaseMetrics) {
			this.logger.log('Retrieving lease metrics from cache');
			return cachedLeaseMetrics;
		}
		const expiringLeaseForPeriodCount =
			await this.dashboardRepository.getExpiringLeases(
				currentUser.organizationId,
				30,
			);
		const tenantCount = await this.dashboardRepository.getTenantCount(
			currentUser.organizationId,
		);
		const avgLeaseDuration =
			await this.dashboardRepository.getAverageLeaseDuration(
				currentUser.organizationId,
			);
		const activeLeaseCount = await this.dashboardRepository.getActiveLeaseCount(
			currentUser.organizationId,
		);
		const activeLeaseForPeriodCount =
			await this.dashboardRepository.getActiveLeaseCount(
				currentUser.organizationId,
				30,
			);
		const activeLeaseForPeriodPercentageDifference =
			activeLeaseCount > 0 && activeLeaseForPeriodCount > 0
				? this.util.getPercentageIncreaseOrDecrease(
						activeLeaseForPeriodCount,
						activeLeaseCount,
					)
				: 0;
		const activeLeaseForPeriodChangeIndicator =
			activeLeaseCount > activeLeaseForPeriodCount
				? 'positive'
				: activeLeaseCount < activeLeaseForPeriodCount
					? 'negative'
					: 'neutral';
		const leaseMetrics: LeaseMetricsDto = {
			expiringLeaseForPeriodCount,
			tenantCount,
			avgLeaseDuration,
			activeLeaseCount,
			activeLeaseForPeriodCount,
			activeLeaseForPeriodPercentageDifference,
			activeLeaseForPeriodChangeIndicator,
		};
		await this.cacheManager.set(cacheKey, leaseMetrics, this.cacheTTL);
		this.updateOrgCacheKeys(
			cacheKey,
			`${currentUser.organizationId}/getLeaseListKeys`,
		);
		return leaseMetrics;
	}
	async getOverdueRentSummary(): Promise<RentOverdueLeaseDto> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		const overdueRentSummary = await this.leaseService.getTotalOverdueRents(
			currentUser.organizationId,
		);
		return overdueRentSummary;
	}
}
