import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyRepository } from '../repositories/properties.repository';
import { Property } from '../entities/property.entity';
import { PageOptionsDto } from '@app/common';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PropertyDto } from '../dto/property-response.dto';

@Injectable()
export class PropertiesService {
	private readonly logger = new Logger(PropertiesService.name);
	constructor(
		@InjectRepository(PropertyRepository)
		private readonly propertyRepository: PropertyRepository,
		@InjectMapper() private readonly mapper: Mapper,
	) {}

	async getPropertyById(id: number): Promise<Property> {
		const property = await this.propertyRepository.findOneBy({ id: id });
		if (!property) {
			throw new NotFoundException('Property not found');
		}
		return property;
	}

	async updateProperty(id: number, updateData: UpdatePropertyDto) {
		try {
			this.logger.verbose(`Updating property data by Id: ${id}`);
			const property = await this.getPropertyById(id);
			Object.assign(property, updateData);
			const updatedProp = await this.propertyRepository.save(property);
			return this.mapper.map(updatedProp, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error updating Property Data', error);
			return new Error(`Error updating Property Data. Error: ${error}`);
		}
	}

	async deleteProperty(id: number): Promise<void> {
		try {
			this.logger.verbose(`Deleting Property by id: ${id}`);
			const property = await this.getPropertyById(id);
			await this.propertyRepository.remove(property);
		} catch (error) {
			this.logger.error('Error deleting Property Data', error);
			throw new Error(`Error deleting Property Data. Error: ${error}`);
		}
	}

	async archiveProperty(id: number) {
		try {
			this.logger.verbose(`Archiving Property by id: ${id}`);
			const property = await this.getPropertyById(id);
			property.isArchived = true;
			property.archivedDate = new Date();
			await this.propertyRepository.save(property);
			// return this.mapper.map(archivedProperty, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error archiving Property Data', error);
			return new Error(`Error archiving Property Data. Error: ${error}`);
		}
	}

	async createProperty(propertyData: CreatePropertyDto) {
		try {
			this.logger.verbose(`Creating new property`);
			const property = this.propertyRepository.create(propertyData);
			const createdProperty = await this.propertyRepository.save(property);
			return this.mapper.map(createdProperty, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error creating Property Data', error);
			return new Error(`Error creating Property Data. Error: ${error}`);
		}
	}

	async getAllPropertiesByOrganization(
		organizationUuid: string,
		pageDto?: PageOptionsDto,
	): Promise<Property[]> {
		return await this.propertyRepository.find({
			where: { organization: { organizationUuid } },
			take: pageDto.take,
			skip: (pageDto.page - 1) * pageDto.take,
		});
	}

	async getAllPropertiesByFilter(
		filter: any,
		pageDto?: PageOptionsDto,
	): Promise<Property[]> {
		return await this.propertyRepository.find({
			where: filter,
			take: pageDto.take,
			skip: (pageDto.page - 1) * pageDto.take,
		});
	}

	async createPropertyForOrganization(
		organizationUuid: string,
		propertyData: Partial<Property>,
	) {
		try {
			this.logger.verbose(`Creating new property`);
			const property = this.propertyRepository.create({
				...propertyData,
				organization: { organizationUuid },
			});
			const createdProperty = await this.propertyRepository.save(property);
			return this.mapper.map(createdProperty, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error creating Property Data', error);
			throw new Error(`Error creating Property Data. Error: ${error}`);
		}
	}
}
