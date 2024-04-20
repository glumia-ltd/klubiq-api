import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyType } from '@app/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
	CreatePropertyCategoryDto,
	UpdatePropertyCategoryDto,
} from '../dto/property-category.dto';
import { PropertyTypeRepository } from '../repositories/properties-type.repository';
import { PropertyPeripheralDto } from '../dto/properties-peripheral.dto';

@Injectable()
export class PropertiesTypeService {
	private readonly logger = new Logger(PropertiesTypeService.name);
	constructor(
		@InjectRepository(PropertyTypeRepository)
		private readonly propertyTypeRepository: PropertyTypeRepository,
		@InjectMapper() private readonly mapper: Mapper,
	) {}

	async createPropertyType(
		createPropertyTypeDto: CreatePropertyCategoryDto,
	): Promise<PropertyType> {
		const { name, displayText } = createPropertyTypeDto;
		const propertyType = this.propertyTypeRepository.create({
			name,
			displayText,
		});
		return await this.propertyTypeRepository.save(propertyType);
	}

	async getPropertyTypeByName(name: string): Promise<PropertyType> {
		const propertyType = await this.propertyTypeRepository.findOneBy({
			name: name,
		});
		if (!propertyType) {
			throw new NotFoundException('Property Type not found');
		}
		return propertyType;
	}

	async getAllPropertyTypes() {
		const allTypes = await this.propertyTypeRepository.find();
		return allTypes.map((type) =>
			this.mapper.map(type, PropertyType, PropertyPeripheralDto),
		);
	}

	async updatePropertyType(
		name: string,
		updatePropertyTypeDto: UpdatePropertyCategoryDto,
	): Promise<PropertyType> {
		const propertyType = await this.getPropertyTypeByName(name);
		return await this.propertyTypeRepository.save({
			...propertyType,
			...updatePropertyTypeDto,
		});
	}

	async deletePropertyType(name: string): Promise<void> {
		const propertyType = await this.getPropertyTypeByName(name);
		await this.propertyTypeRepository.remove(propertyType);
	}
}
