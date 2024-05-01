import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PropertyCategory } from '@app/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PropertyCategoryRepository } from '../repositories/properties-category.repository';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../dto/create-property-metadata.dto';
import { PropertyMetadataDto } from '../dto/properties-metadata.dto';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PropertiesCategoryService {
	private readonly logger = new Logger(PropertiesCategoryService.name);
	private readonly cacheKey = 'property-categories';
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly propertyCategoryRepository: PropertyCategoryRepository,
		@InjectMapper() private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async createPropertyCategory(
		createPropertyCategoryDto: CreatePropertyMetadataDto,
	): Promise<PropertyCategory> {
		try {
			const { name, displayText } = createPropertyCategoryDto;
			const propertyCategory = this.propertyCategoryRepository.create({
				name,
				displayText,
			});
			const createdCategory =
				await this.propertyCategoryRepository.save(propertyCategory);
			const mappedCategory = await this.mapper.map(
				createdCategory,
				PropertyCategory,
				PropertyMetadataDto,
			);
			await this.cacheService.updateCacheAfterCreate<PropertyMetadataDto>(
				this.cacheKey,
				mappedCategory,
			);
			return mappedCategory;
		} catch (err) {
			this.logger.error('Error creating property category', err);
			throw err;
		}
	}

	async getPropertyCategoryById(id: number): Promise<PropertyCategory> {
		try {
			const propertyCategory = await this.propertyCategoryRepository.findOneBy({
				id: id,
			});
			if (!propertyCategory) {
				throw new NotFoundException('Property category not found');
			}
			return this.mapper.map(
				propertyCategory,
				PropertyCategory,
				PropertyMetadataDto,
			);
		} catch (err) {
			this.logger.error('Error getting property category', err);
			throw err;
		}
	}

	async getAllPropertyCategories() {
		try {
			const cachedPropertyCategoriesList =
				await this.cacheService.getCache<PropertyMetadataDto>(this.cacheKey);
			if (!cachedPropertyCategoriesList) {
				const allCategories = await this.propertyCategoryRepository.find();
				const data = await this.mapper.mapArrayAsync(
					allCategories,
					PropertyCategory,
					PropertyMetadataDto,
				);
				await this.cacheService.setCache<PropertyMetadataDto[]>(
					data,
					this.cacheKey,
				);
				return data;
			}
			return cachedPropertyCategoriesList;
		} catch (err) {
			this.logger.error('Error getting property categories list', err);
			throw err;
		}
	}

	async updatePropertyCategory(
		id: number,
		updatePropertyCategoryDto: UpdatePropertyMetadataDto,
	): Promise<PropertyCategory> {
		try {
			const propertyCategory = await this.getPropertyCategoryById(id);
			Object.assign(propertyCategory, updatePropertyCategoryDto);
			const updatedCategory = await this.propertyCategoryRepository.save({
				...propertyCategory,
				...updatePropertyCategoryDto,
			});
			await this.cacheService.updateCacheAfterUpsert<PropertyMetadataDto>(
				this.cacheKey,
				'id',
				id,
				updatePropertyCategoryDto,
			);
			return this.mapper.map(
				updatedCategory,
				PropertyCategory,
				PropertyMetadataDto,
			);
		} catch (error) {
			this.logger.error('Error updating property category', error);
			throw error;
		}
	}

	async deletePropertyCategory(id: number): Promise<void> {
		try {
			const propertyCategory = await this.getPropertyCategoryById(id);
			await this.cacheService.updateCacheAfterdelete<PropertyMetadataDto>(
				this.cacheKey,
				'id',
				id,
			);
			await this.propertyCategoryRepository.remove(propertyCategory);
		} catch (error) {
			this.logger.error('Error deleting property category', error);
			throw error;
		}
	}
}
