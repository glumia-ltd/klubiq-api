import { Injectable, Logger } from '@nestjs/common';
// import { EntityManager } from 'typeorm';
import { FeaturesRepository } from '../repositories/features.repository';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ViewFeatureDto } from '../dto/responses/feature-response.dto';
import { Feature } from '../database/entities/feature.entity';
import { CreateFeatureDto } from '../dto/requests/feature-requests.dto';

@Injectable()
export class FeaturesService {
	private readonly logger = new Logger(FeaturesService.name);
	constructor(
		@InjectMapper() private readonly mapper: Mapper,
		private readonly featuresRepository: FeaturesRepository,
	) {}

	// gets all app features
	async getAppFeatures(): Promise<ViewFeatureDto[]> {
		try {
			const features = await this.featuresRepository.findAll();
			const data = this.mapper.mapArrayAsync(features, Feature, ViewFeatureDto);
			return data;
		} catch (err) {
			this.logger.error('Error getting features list', err);
			throw err;
		}
	}

	// gets a feature by Id
	async getFeatureById(id: number): Promise<ViewFeatureDto> {
		try {
			const feature = await this.featuresRepository.findOneWithId({ id });
			const viewData = this.mapper.map(feature, Feature, ViewFeatureDto);
			return viewData;
		} catch (err) {
			this.logger.error(`Error getting feature by Id: ${id}`, err);
			throw err;
		}
	}

	// This creates a new feature
	async create(createFeatureDto: CreateFeatureDto) {
		try {
			const feature =
				await this.featuresRepository.createEntity(createFeatureDto);
			return this.mapper.map(feature, Feature, ViewFeatureDto);
		} catch (err) {
			this.logger.error('Error creating feature', err);
			throw new Error(`Error creating feature. Error: ${err}`);
		}
	}

	// This creates a new feature
	async update(id: number, updateFeature: CreateFeatureDto) {
		try {
			const updatedFeature = await this.featuresRepository.updateEntity(
				{ id },
				updateFeature,
			);
			return this.mapper.map(updatedFeature, Feature, ViewFeatureDto);
		} catch (err) {
			this.logger.error('Error updating feature', err);
			throw new Error(`Error updating feature. Error: ${err}`);
		}
	}

	// This creates a new feature
	async delete(id: number) {
		try {
			const deleted = await this.featuresRepository.deleteEntity({ id });
			return this.mapper.map(deleted, Feature, ViewFeatureDto);
		} catch (err) {
			this.logger.error('Error deleting feature', err);
			throw new Error(`Error deleting feature. Error: ${err}`);
		}
	}
}
