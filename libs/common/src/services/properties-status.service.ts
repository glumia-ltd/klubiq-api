import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../dto/requests/create-property-metadata.dto';
import { PropertyStatusRepository } from '../repositories/properties-status.repository';
import { PropertyMetadataDto } from '../dto/responses/properties-metadata.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { Cache } from 'cache-manager';
import { CacheKeys } from '../config/config.constants';
import { PropertyStatus } from '../database/entities/property-status.entity';

@Injectable()
export class PropertiesStatusService {
	private readonly logger = new Logger(PropertiesStatusService.name);
	private readonly cacheKey = CacheKeys.PROPERTY_STATUSES;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly propertyStatusRepository: PropertyStatusRepository,
		@InjectMapper() private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async createPropertyStatus(
		createPropertyStatusDto: CreatePropertyMetadataDto,
	): Promise<PropertyStatus> {
		try {
			const { name, displayText } = createPropertyStatusDto;
			const propertyStatus = this.propertyStatusRepository.create({
				name,
				displayText,
			});
			const createdStatus =
				await this.propertyStatusRepository.save(propertyStatus);
			const mappedStatus = await this.mapper.map(
				createdStatus,
				PropertyStatus,
				PropertyMetadataDto,
			);
			await this.cacheService.updateCacheAfterCreate<PropertyMetadataDto>(
				this.cacheKey,
				mappedStatus,
			);
			return mappedStatus;
		} catch (err) {
			this.logger.error('Error creating property status', err);
			throw err;
		}
	}

	async getPropertyStatusById(id: number): Promise<PropertyStatus> {
		try {
			const propertyStatus = await this.propertyStatusRepository.findOneBy({
				id: id,
			});
			if (!propertyStatus) {
				throw new NotFoundException('Property status not found');
			}
			return this.mapper.map(
				propertyStatus,
				PropertyStatus,
				PropertyMetadataDto,
			);
		} catch (err) {
			this.logger.error('Error getting property status', err);
			throw err;
		}
	}

	async getAllPropertyStatus() {
		try {
			const cachedPropertyStatusList =
				await this.cacheService.getCache<PropertyMetadataDto>(this.cacheKey);
			if (!cachedPropertyStatusList) {
				const allStatus = await this.propertyStatusRepository.find();
				const data = await this.mapper.mapArrayAsync(
					allStatus,
					PropertyStatus,
					PropertyMetadataDto,
				);
				await this.cacheService.setCache<PropertyMetadataDto[]>(
					data,
					this.cacheKey,
				);
				return data;
			}
			return cachedPropertyStatusList;
		} catch (err) {
			this.logger.error('Error getting property status list', err);
			throw err;
		}
	}

	async updatePropertyStatus(
		id: number,
		updatePropertyStatusDto: UpdatePropertyMetadataDto,
	): Promise<PropertyStatus> {
		try {
			const propertyStatus = await this.getPropertyStatusById(id);
			Object.assign(propertyStatus, updatePropertyStatusDto);
			const updatedStatus = await this.propertyStatusRepository.save({
				...propertyStatus,
				...updatePropertyStatusDto,
			});
			await this.cacheService.updateCacheAfterUpsert<PropertyMetadataDto>(
				this.cacheKey,
				'id',
				id,
				updatePropertyStatusDto,
			);
			return this.mapper.map(
				updatedStatus,
				PropertyStatus,
				PropertyMetadataDto,
			);
		} catch (error) {
			this.logger.error('Error updating property status', error);
			throw error;
		}
	}

	async deletePropertyStatus(id: number): Promise<void> {
		try {
			const propertyStatus = await this.getPropertyStatusById(id);
			await this.cacheService.updateCacheAfterdelete<PropertyMetadataDto>(
				this.cacheKey,
				'id',
				id,
			);
			await this.propertyStatusRepository.remove(propertyStatus);
		} catch (error) {
			this.logger.error('Error deleting property status', error);
			throw error;
		}
	}
}
