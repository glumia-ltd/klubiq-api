import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyStatus } from '@app/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
	CreatePropertyCategoryDto,
	UpdatePropertyCategoryDto,
} from '../../../../apps/klubiq-dashboard/src/properties/dto/property-category.dto';
import { PropertyStatusRepository } from '../repositories/properties-status.repository';
import { PropertyPeripheralDto } from '../../../../apps/klubiq-dashboard/src/properties/dto/properties-peripheral.dto';

@Injectable()
export class PropertiesStatusService {
	private readonly logger = new Logger(PropertiesStatusService.name);
	constructor(
		@InjectRepository(PropertyStatusRepository)
		private readonly propertyStatusRepository: PropertyStatusRepository,
		@InjectMapper() private readonly mapper: Mapper,
	) {}

	async createPropertyStatus(
		createPropertyStatusDto: CreatePropertyCategoryDto,
	): Promise<PropertyStatus> {
		const { name, displayText } = createPropertyStatusDto;
		const propertyStatus = this.propertyStatusRepository.create({
			name,
			displayText,
		});
		return await this.propertyStatusRepository.save(propertyStatus);
	}

	async getPropertyStatusByName(name: string): Promise<PropertyStatus> {
		const propertyStatus = await this.propertyStatusRepository.findOneBy({
			name: name,
		});
		if (!propertyStatus) {
			throw new NotFoundException('Property Status not found');
		}
		return propertyStatus;
	}

	async getAllPropertyStatus() {
		const allStatus = await this.propertyStatusRepository.find();
		return allStatus.map((status) =>
			this.mapper.map(status, PropertyStatus, PropertyPeripheralDto),
		);
	}

	async updatePropertyStatus(
		name: string,
		updatePropertyStatusDto: UpdatePropertyCategoryDto,
	): Promise<PropertyStatus> {
		const propertyStatus = await this.getPropertyStatusByName(name);
		return await this.propertyStatusRepository.save({
			...propertyStatus,
			...updatePropertyStatusDto,
		});
	}

	async deletePropertyStatus(name: string): Promise<void> {
		const propertyStatus = await this.getPropertyStatusByName(name);
		await this.propertyStatusRepository.remove(propertyStatus);
	}
}
