import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PropertyCategoryRepository } from '../repositories/properties-category.repository';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../dto/requests/create-property-metadata.dto';
import { PropertyMetadataDto } from '../dto/responses/properties-metadata.dto';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKeys } from '../config/config.constants';
import { PropertyCategory } from '../database/entities/property-category.entity';

@Injectable()
export class PropertiesCategoryService {
	private readonly logger = new Logger(PropertiesCategoryService.name);
	private readonly cacheKey = CacheKeys.PROPERTY_CATEGORIES;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly propertyCategoryRepository: PropertyCategoryRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async createPropertyCategory(
		createPropertyCategoryDto: CreatePropertyMetadataDto,
	): Promise<PropertyMetadataDto> {
		try {
			const { name, displayText } = createPropertyCategoryDto;
			const propertyCategory = this.propertyCategoryRepository.create({
				name,
				displayText,
			});
			const createdCategory =
				await this.propertyCategoryRepository.save(propertyCategory);
			const mappedCategory = await this.mapper.mapAsync(
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
			throw new BadRequestException(`Error creating property category.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}

	async getPropertyCategoryById(id: number): Promise<PropertyMetadataDto> {
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
			throw new BadRequestException(`Error getting property category.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}

	async getAllPropertyCategories(): Promise<PropertyMetadataDto[]> {
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
			throw new BadRequestException(`Error getting property categories list.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}

	async updatePropertyCategory(
		id: number,
		updatePropertyCategoryDto: UpdatePropertyMetadataDto,
	): Promise<PropertyMetadataDto> {
		try {
			const propertyCategory = await this.getPropertyCategoryById(id);
			if (!propertyCategory) {
				throw new NotFoundException('Property category not found');
			}
			propertyCategory.name = updatePropertyCategoryDto.name;
			propertyCategory.displayText = updatePropertyCategoryDto.displayText;
			propertyCategory.metaData = {
				...propertyCategory.metaData,
				...updatePropertyCategoryDto.metaData,
			};
			const updatedCategory =
				await this.propertyCategoryRepository.save(propertyCategory);
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
		} catch (err) {
			this.logger.error('Error updating property category', err);
			throw new BadRequestException(`Error updating property category.`, {
				cause: new Error(),
				description: err.message,
			});
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
		} catch (err) {
			this.logger.error('Error deleting property category', err);
			throw new BadRequestException(`Error deleting property category.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}
}
