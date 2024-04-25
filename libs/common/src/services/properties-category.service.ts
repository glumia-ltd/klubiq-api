import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyCategory } from '@app/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PropertyCategoryRepository } from '../repositories/properties-category.repository';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../dto/create-property-metadata.dto';
import { PropertyMetadataDto } from '../dto/properties-metadata.dto';

@Injectable()
export class PropertiesCategoryService {
	private readonly logger = new Logger(PropertiesCategoryService.name);
	constructor(
		@InjectRepository(PropertyCategoryRepository)
		private readonly propertyCategoryRepository: PropertyCategoryRepository,
		@InjectMapper() private readonly mapper: Mapper,
	) {}

	async createPropertyCategory(
		createPropertyCategoryDto: CreatePropertyMetadataDto,
	): Promise<PropertyCategory> {
		const { name, displayText } = createPropertyCategoryDto;
		const propertyCategory = this.propertyCategoryRepository.create({
			name,
			displayText,
		});
		return await this.propertyCategoryRepository.save(propertyCategory);
	}

	async getPropertyCategoryByName(name: string): Promise<PropertyCategory> {
		const propertyCategory = await this.propertyCategoryRepository.findOneBy({
			name: name,
		});
		if (!propertyCategory) {
			throw new NotFoundException('Property category not found');
		}
		return propertyCategory;
	}

	async getAllPropertyCategories() {
		const allCategories = await this.propertyCategoryRepository.find();
		return allCategories.map((category) =>
			this.mapper.map(category, PropertyCategory, PropertyMetadataDto),
		);
	}

	async updatePropertyCategory(
		name: string,
		updatePropertyCategoryDto: UpdatePropertyMetadataDto,
	): Promise<PropertyCategory> {
		const propertyCategory = await this.getPropertyCategoryByName(name);
		return await this.propertyCategoryRepository.save({
			...propertyCategory,
			...updatePropertyCategoryDto,
		});
	}

	async deletePropertyCategory(name: string): Promise<void> {
		const propertyCategory = await this.getPropertyCategoryByName(name);
		await this.propertyCategoryRepository.remove(propertyCategory);
	}
}
