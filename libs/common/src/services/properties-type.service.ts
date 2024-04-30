import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@app/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../dto/create-property-metadata.dto';
import { PropertyTypeRepository } from '../repositories/properties-type.repository';
import { PropertyMetadataDto } from '../dto/properties-metadata.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Injectable()
export class PropertiesTypeService {
	private readonly logger = new Logger(PropertiesTypeService.name);
	private readonly cacheKey = 'property-type';
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly propertyTypeRepository: PropertyTypeRepository,
		@InjectMapper() private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async createPropertyType(
		createPropertyTypeDto: CreatePropertyMetadataDto,
	): Promise<PropertyType> {
		try {
			const { name, displayText } = createPropertyTypeDto;
			const propertyType = this.propertyTypeRepository.create({
				name,
				displayText,
			});
			const createdType = await this.propertyTypeRepository.save(propertyType);
			const mappedType = await this.mapper.map(
				createdType,
				PropertyType,
				PropertyMetadataDto,
			);
			await this.cacheService.updateCacheAfterCreate<PropertyMetadataDto>(
				this.cacheKey,
				mappedType,
			);
			return mappedType;
		} catch (err) {
			this.logger.error('Error creating property type', err);
			throw err;
		}
	}

	async getPropertyTypeById(id: number): Promise<PropertyType> {
		try {
			const cachedPropertyType =
				await this.cacheService.getCacheByIdentifier<PropertyMetadataDto>(
					this.cacheKey,
					'id',
					id,
				);
			if (!cachedPropertyType) {
				const propertyType = await this.propertyTypeRepository.findOneBy({
					id: id,
				});
				if (!propertyType) {
					throw new NotFoundException('Property type not found');
				}
				return this.mapper.map(propertyType, PropertyType, PropertyMetadataDto);
			}
			return cachedPropertyType;
		} catch (err) {
			this.logger.error('Error getting property type', err);
			throw err;
		}
	}

	async getAllPropertyTypes() {
		try {
			const cachedPropertyTypesList =
				await this.cacheService.getCache<PropertyMetadataDto>(this.cacheKey);
			if (!cachedPropertyTypesList) {
				const allTypes = await this.propertyTypeRepository.find();
				const data = await this.mapper.mapArrayAsync(
					allTypes,
					PropertyType,
					PropertyMetadataDto,
				);
				await this.cacheService.setCache<PropertyMetadataDto[]>(
					data,
					this.cacheKey,
				);
				return data;
			}
			return cachedPropertyTypesList;
		} catch (err) {
			this.logger.error('Error getting property type list', err);
			throw err;
		}
	}

	async updatePropertyType(
		id: number,
		updatePropertyTypeDto: UpdatePropertyMetadataDto,
	): Promise<PropertyType> {
		try {
			const propertyType = await this.getPropertyTypeById(id);
			Object.assign(propertyType, updatePropertyTypeDto);
			const updatedType = await this.propertyTypeRepository.save({
				...propertyType,
				...updatePropertyTypeDto,
			});
			await this.cacheService.updateCacheAfterUpsert<PropertyMetadataDto>(
				this.cacheKey,
				'id',
				id,
				updatePropertyTypeDto,
			);
			return this.mapper.map(updatedType, PropertyType, PropertyMetadataDto);
		} catch (error) {
			this.logger.error('Error updating property type', error);
			throw error;
		}
	}

	async deletePropertyType(id: number): Promise<void> {
		try {
			const propertyType = await this.getPropertyTypeById(id);
			await this.cacheService.updateCacheAfterdelete<PropertyMetadataDto>(
				this.cacheKey,
				'id',
				id,
			);
			await this.propertyTypeRepository.remove(propertyType);
		} catch (error) {
			this.logger.error('Error deleting property type', error);
			throw error;
		}
	}
}
