import { Inject, Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FeaturePermission } from '../database/entities/feature-permission.entity';
import { FeaturesPermissionRepository } from '../repositories/features-permission.repository';
import { CreateFeaturePermissionDto } from '../dto/requests/permission-requests.dto';
import { CacheKeys } from '../config/config.constants';

@Injectable()
export class FeaturePermissionService {
	private readonly logger = new Logger(FeaturePermissionService.name);
	private readonly cacheKey = CacheKeys.FEATURE_PERMISSIONS;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly featuresPermissionRepository: FeaturesPermissionRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async getFeaturePermissions(): Promise<FeaturePermission[]> {
		try {
			const cachedData = await this.cacheService.getCache<FeaturePermission>(
				this.cacheKey,
			);
			if (cachedData) return cachedData;
			const featurePermissions =
				await this.featuresPermissionRepository.findAll();
			await this.cacheService.setCache(featurePermissions, this.cacheKey);
			return featurePermissions;
		} catch (err) {
			this.logger.error('Error getting FeaturePermissions', err);
			throw new Error(`Error getting FeaturePermissions. Error: ${err}`);
		}
	}

	async getFeaturePermissionsById(
		featureId: number,
		permissionId: number,
	): Promise<FeaturePermission> {
		try {
			const cachedData =
				await this.cacheService.getCacheByIdentifiers<FeaturePermission>(
					this.cacheKey,
					['featureId', 'permissionId'],
					[featureId, permissionId],
				);
			if (!cachedData) {
				const featurePermission =
					await this.featuresPermissionRepository.getFeaturePermissions(
						featureId,
						permissionId,
					);
				await this.cacheService.setCache(featurePermission, this.cacheKey);
				return featurePermission;
			}
			return cachedData;
		} catch (err) {
			this.logger.error('Error getting FeaturePermission by id', err);
			throw new Error(`Error getting FeaturePermission by id.. Error: ${err}`);
		}
	}

	async createFeaturePermission(
		createDto: CreateFeaturePermissionDto,
	): Promise<FeaturePermission> {
		try {
			const featurePermission =
				await this.featuresPermissionRepository.createFeaturePermissions(
					createDto,
				);
			await this.cacheService.updateCacheAfterCreate<FeaturePermission>(
				this.cacheKey,
				featurePermission,
			);
			return featurePermission;
		} catch (err) {
			this.logger.error('Error creating FeaturePermissions', err);
			throw new Error(`Error creating FeaturePermissions. Error: ${err}`);
		}
	}

	async deleteFeaturePermission(
		featureId: number,
		permissionId: number,
	): Promise<void> {
		try {
			await this.featuresPermissionRepository.deleteFeaturePermissions(
				featureId,
				permissionId,
			);
			await this.cacheService.updateCacheAfterdeleteWithIdentifiers<FeaturePermission>(
				this.cacheKey,
				['featureId', 'permissionId'],
				[featureId, permissionId],
			);
		} catch (err) {
			this.logger.error('Error creating FeaturePermissions', err);
			throw new Error(`Error creating FeaturePermissions. Error: ${err}`);
		}
	}
}
