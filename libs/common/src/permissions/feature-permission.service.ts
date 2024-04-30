import { Inject, Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FeaturePermission } from '../database/entities/feature-permission.entity';
import { FeaturesPermissionRepository } from '../repositories/features-permission.repository';
import { ViewFeaturePermissionDto } from '..';

@Injectable()
export class FeaturePermissionService {
	private readonly logger = new Logger(FeaturePermissionService.name);
	private readonly cacheKey = 'feature-permissions';
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly featuresPermissionRepository: FeaturesPermissionRepository,
		@InjectMapper() private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async getFeaturePermissions(): Promise<ViewFeaturePermissionDto[]> {
		try {
			const cachedData =
				await this.cacheService.getCache<ViewFeaturePermissionDto>(
					this.cacheKey,
				);
			if (cachedData) return cachedData;
			const featurePermissions =
				await this.featuresPermissionRepository.findAll();
			const data = await this.mapper.mapArrayAsync(
				featurePermissions,
				FeaturePermission,
				ViewFeaturePermissionDto,
			);
			await this.cacheService.setCache(data, this.cacheKey);
			return data;
		} catch (err) {
			throw err;
		}
	}
}
