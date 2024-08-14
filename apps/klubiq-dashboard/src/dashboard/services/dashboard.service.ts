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
import { DateTime } from 'luxon';
import { FileDownloadService } from '@app/common/services/file-download.service';

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
		private readonly fileDownloadService: FileDownloadService,
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
			? DateTime.fromISO(startDateStr).toSQL()
			: null;
		const endDate = endDateStr ? DateTime.fromISO(endDateStr).toSQL() : null;
		const result = await this.dashboardRepository.getMonthlyRevenueData(
			currentUser.organizationId,
			startDate,
			endDate,
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

	async getRevenueDataForDownload(
		startDateStr: string,
		endDateStr: string,
	): Promise<Buffer> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);

			const startDate = DateTime.fromISO(startDateStr).toSQL();
			const endDate = DateTime.fromISO(endDateStr).toSQL();

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
}
