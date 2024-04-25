import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyPurpose } from '@app/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../dto/create-property-metadata.dto';
import { PropertyPurposeRepository } from '../repositories/properties-purpose.repository';
import { PropertyMetadataDto } from '../dto/properties-metadata.dto';

@Injectable()
export class PropertiesPurposeService {
	private readonly logger = new Logger(PropertiesPurposeService.name);
	constructor(
		@InjectRepository(PropertyPurposeRepository)
		private readonly propertyPurposeRepository: PropertyPurposeRepository,
		@InjectMapper() private readonly mapper: Mapper,
	) {}

	async createPropertyPurpose(
		createPropertyPurposeDto: CreatePropertyMetadataDto,
	): Promise<PropertyPurpose> {
		const { name, displayText } = createPropertyPurposeDto;
		const propertyPurpose = this.propertyPurposeRepository.create({
			name,
			displayText,
		});
		return await this.propertyPurposeRepository.save(propertyPurpose);
	}

	async getPropertyPurposeByName(name: string): Promise<PropertyPurpose> {
		const propertyPurpose = await this.propertyPurposeRepository.findOneBy({
			name: name,
		});
		if (!propertyPurpose) {
			throw new NotFoundException('Property Purpose not found');
		}
		return propertyPurpose;
	}

	async getAllPropertyPurpose() {
		const allPurposes = await this.propertyPurposeRepository.find();
		return allPurposes.map((purpose) =>
			this.mapper.map(purpose, PropertyPurpose, PropertyMetadataDto),
		);
	}

	async updatePropertyPurpose(
		name: string,
		updatePropertyPurposeDto: UpdatePropertyMetadataDto,
	): Promise<PropertyPurpose> {
		const propertyPurpose = await this.getPropertyPurposeByName(name);
		return await this.propertyPurposeRepository.save({
			...propertyPurpose,
			...updatePropertyPurposeDto,
		});
	}

	async deletePropertyPurpose(name: string): Promise<void> {
		const propertyPurpose = await this.getPropertyPurposeByName(name);
		await this.propertyPurposeRepository.remove(propertyPurpose);
	}
}
