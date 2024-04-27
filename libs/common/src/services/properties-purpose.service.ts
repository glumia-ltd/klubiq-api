import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

	async getPropertyPurposeById(id: number): Promise<PropertyPurpose> {
		const propertyPurpose = await this.propertyPurposeRepository.findOneBy({
			id: id,
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
		id: number,
		updatePropertyPurposeDto: UpdatePropertyMetadataDto,
	): Promise<PropertyPurpose> {
		const propertyPurpose = await this.getPropertyPurposeById(id);
		return await this.propertyPurposeRepository.save({
			...propertyPurpose,
			...updatePropertyPurposeDto,
		});
	}

	async deletePropertyPurpose(id: number): Promise<void> {
		const propertyPurpose = await this.getPropertyPurposeById(id);
		await this.propertyPurposeRepository.remove(propertyPurpose);
	}
}
