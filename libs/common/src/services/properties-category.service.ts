import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

	async getPropertyCategoryById(id: number): Promise<PropertyCategory> {
		const propertyCategory = await this.propertyCategoryRepository.findOneBy({
			id: id,
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
		id: number,
		updatePropertyCategoryDto: UpdatePropertyMetadataDto,
	): Promise<PropertyCategory> {
		const propertyCategory = await this.getPropertyCategoryById(id);
		return await this.propertyCategoryRepository.save({
			...propertyCategory,
			...updatePropertyCategoryDto,
		});
	}

	async deletePropertyCategory(id: number): Promise<void> {
		const propertyCategory = await this.getPropertyCategoryById(id);
		await this.propertyCategoryRepository.remove(propertyCategory);
	}
}
