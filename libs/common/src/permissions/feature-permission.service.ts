import { Inject, Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FeaturePermission } from '../database/entities/feature-permission.entity';
import { FeaturesPermissionRepository } from '../repositories/features-permission.repository';
import { ViewFeaturePermissionDto } from '..';
import { CreateFeaturePermissionDto } from '../dto/requests/permission-requests.dto';

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
			this.logger.error('Error getting FeaturePermissions', err);
			throw new Error(`Error getting FeaturePermissions. Error: ${err}`);
		}
	}

	async getFeaturePermissionsById(
		id: number,
	): Promise<ViewFeaturePermissionDto> {
		try {
			const cachedData =
				await this.cacheService.getCacheByIdentifier<ViewFeaturePermissionDto>(
					this.cacheKey,
					'id',
					id,
				);
			if (!cachedData) {
				const featurePermission =
					await this.featuresPermissionRepository.findOneBy({
						featurePermissionId: id,
					});
				const data = await this.mapper.mapAsync(
					featurePermission,
					FeaturePermission,
					ViewFeaturePermissionDto,
				);
				await this.cacheService.setCache(data, this.cacheKey);
				return data;
			}
		} catch (err) {
			this.logger.error('Error getting FeaturePermission by id', err);
			throw new Error(`Error getting FeaturePermission by id.. Error: ${err}`);
		}
	}

	async createFeaturePermission(
		createDto: CreateFeaturePermissionDto,
	): Promise<ViewFeaturePermissionDto> {
		try {
			const featurePermission =
				await this.featuresPermissionRepository.createEntity(createDto);
			const data = await this.mapper.mapAsync(
				featurePermission,
				FeaturePermission,
				ViewFeaturePermissionDto,
			);
			await this.cacheService.updateCacheAfterCreate<ViewFeaturePermissionDto>(
				this.cacheKey,
				data,
			);
			return data;
		} catch (err) {
			this.logger.error('Error creating FeaturePermissions', err);
			throw new Error(`Error creating FeaturePermissions. Error: ${err}`);
		}
	}
}
