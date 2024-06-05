import { Inject, Injectable, Logger } from '@nestjs/common';
// import { EntityManager } from 'typeorm';
import { FeaturesRepository } from '../repositories/features.repository';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ViewFeatureDto } from '../dto/responses/feature-response.dto';
import { Feature } from '../database/entities/feature.entity';
import {
	CreateFeatureDto,
	UpdateFeatureDto,
} from '../dto/requests/feature-requests.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from './cache.service';
import { CacheKeys } from '..';

@Injectable()
export class FeaturesService {
	private readonly logger = new Logger(FeaturesService.name);
	private readonly cacheKey = CacheKeys.FEATURES;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		private readonly featuresRepository: FeaturesRepository,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	// gets all app features
	async getAppFeatures(): Promise<ViewFeatureDto[]> {
		try {
			const cachedFeatureList =
				await this.cacheService.getCache<ViewFeatureDto>(this.cacheKey);
			if (!cachedFeatureList) {
				const features = await this.featuresRepository.findAll();
				const data = await this.mapper.mapArrayAsync(
					features,
					Feature,
					ViewFeatureDto,
				);
				await this.cacheService.setCache<ViewFeatureDto[]>(data, this.cacheKey);
				return data;
			}
			return cachedFeatureList;
		} catch (err) {
			this.logger.error('Error getting features list', err);
			throw err;
		}
	}

	// gets a feature by Id
	async getFeatureById(id: number): Promise<ViewFeatureDto> {
		try {
			const cachedFeature =
				await this.cacheService.getCacheByIdentifier<ViewFeatureDto>(
					this.cacheKey,
					'id',
					id,
				);
			if (!cachedFeature) {
				const feature = await this.featuresRepository.findOneWithId({ id });
				const viewData = this.mapper.map(feature, Feature, ViewFeatureDto);
				return viewData;
			}
			return cachedFeature;
		} catch (err) {
			this.logger.error(`Error getting feature by Id: ${id}`, err);
			throw err;
		}
	}

	// This creates a new feature
	async create(createFeatureDto: CreateFeatureDto): Promise<ViewFeatureDto> {
		try {
			const feature =
				await this.featuresRepository.createEntity(createFeatureDto);
			const viewData = this.mapper.map(feature, Feature, ViewFeatureDto);
			await this.cacheService.updateCacheAfterCreate<ViewFeatureDto>(
				this.cacheKey,
				viewData,
			);
			return viewData;
		} catch (err) {
			this.logger.error('Error creating feature', err);
			throw new Error(`Error creating feature. Error: ${err}`);
		}
	}

	// This updates a feature
	async update(
		id: number,
		updateFeature: UpdateFeatureDto,
	): Promise<ViewFeatureDto> {
		try {
			await this.featuresRepository.update({ id }, updateFeature);
			const updated =
				await this.cacheService.updateCacheAfterUpsert<ViewFeatureDto>(
					this.cacheKey,
					'id',
					id,
					updateFeature,
				);
			if (!updated) {
				const updatedFeature = await this.featuresRepository.findOneWithId({
					id,
				});
				return this.mapper.map(updatedFeature, Feature, ViewFeatureDto);
			}
			return updated;
		} catch (err) {
			this.logger.error('Error updating feature', err);
			throw new Error(`Error updating feature. Error: ${err}`);
		}
	}

	// This deletes a feature
	async delete(id: number): Promise<boolean> {
		try {
			await this.cacheService.updateCacheAfterdelete<ViewFeatureDto>(
				this.cacheKey,
				'id',
				id,
			);
			const deleted = await this.featuresRepository.delete({ id });
			return deleted.affected == 1;
		} catch (err) {
			this.logger.error('Error deleting feature', err);
			throw new Error(`Error deleting feature. Error: ${err}`);
		}
	}
}
