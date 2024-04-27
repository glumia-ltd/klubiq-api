import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PropertyStatus } from '@app/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../dto/create-property-metadata.dto';
import { PropertyStatusRepository } from '../repositories/properties-status.repository';
import { PropertyMetadataDto } from '../dto/properties-metadata.dto';

@Injectable()
export class PropertiesStatusService {
	private readonly logger = new Logger(PropertiesStatusService.name);
	constructor(
		private readonly propertyStatusRepository: PropertyStatusRepository,
		@InjectMapper() private readonly mapper: Mapper,
	) {}

	async createPropertyStatus(
		createPropertyStatusDto: CreatePropertyMetadataDto,
	): Promise<PropertyStatus> {
		const { name, displayText } = createPropertyStatusDto;
		const propertyStatus = this.propertyStatusRepository.create({
			name,
			displayText,
		});
		return await this.propertyStatusRepository.save(propertyStatus);
	}

	async getPropertyStatusById(id: number): Promise<PropertyStatus> {
		const propertyStatus = await this.propertyStatusRepository.findOneBy({
			id: id,
		});
		if (!propertyStatus) {
			throw new NotFoundException('Property Status not found');
		}
		return propertyStatus;
	}

	async getAllPropertyStatus() {
		const allStatus = await this.propertyStatusRepository.find();
		return allStatus.map((status) =>
			this.mapper.map(status, PropertyStatus, PropertyMetadataDto),
		);
	}

	async updatePropertyStatus(
		id: number,
		updatePropertyStatusDto: UpdatePropertyMetadataDto,
	): Promise<PropertyStatus> {
		const propertyStatus = await this.getPropertyStatusById(id);
		return await this.propertyStatusRepository.save({
			...propertyStatus,
			...updatePropertyStatusDto,
		});
	}

	async deletePropertyStatus(id: number): Promise<void> {
		const propertyStatus = await this.getPropertyStatusById(id);
		await this.propertyStatusRepository.remove(propertyStatus);
	}
}
