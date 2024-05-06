import { Inject, Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FeaturePermission } from '../database/entities/feature-permission.entity';
import { FeaturesPermissionRepository } from '../repositories/features-permission.repository';
import { CacheKeys, ViewFeaturePermissionDto } from '..';
import {
	CreateFeaturePermissionDto,
	UpdateFeaturePermissionDto,
} from '../dto/requests/permission-requests.dto';

@Injectable()
export class FeaturePermissionService {
	private readonly logger = new Logger(FeaturePermissionService.name);
	private readonly cacheKey = CacheKeys.FEATURE_PERMISSIONS;
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
					await this.featuresPermissionRepository.findOneWithId({
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
			return cachedData;
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

	async updateFeaturePermission(
		id: number,
		updateDto: UpdateFeaturePermissionDto,
	): Promise<ViewFeaturePermissionDto> {
		try {
			await this.featuresPermissionRepository.update(
				{ featurePermissionId: id },
				updateDto,
			);
			const updated =
				await this.cacheService.updateCacheAfterUpsert<ViewFeaturePermissionDto>(
					this.cacheKey,
					'featurePermissionId',
					id,
					updateDto,
				);
			if (!updated) {
				const updatedFeaturePermission =
					await this.featuresPermissionRepository.findOneWithId({
						featurePermissionId: id,
					});
				return this.mapper.map(
					updatedFeaturePermission,
					FeaturePermission,
					ViewFeaturePermissionDto,
				);
			}
			return updated;
		} catch (err) {
			this.logger.error('Error creating FeaturePermissions', err);
			throw new Error(`Error creating FeaturePermissions. Error: ${err}`);
		}
	}

	async deleteFeaturePermission(id: number): Promise<boolean> {
		try {
			await this.cacheService.updateCacheAfterdelete<ViewFeaturePermissionDto>(
				this.cacheKey,
				'featurePermissionId',
				id,
			);
			const deleted = await this.featuresPermissionRepository.delete({
				featurePermissionId: id,
			});
			return deleted.affected == 1;
		} catch (err) {
			this.logger.error('Error creating FeaturePermissions', err);
			throw new Error(`Error creating FeaturePermissions. Error: ${err}`);
		}
	}
}
