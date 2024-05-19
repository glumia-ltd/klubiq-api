import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyRepository } from '../repositories/properties.repository';
import { Property } from '../entities/property.entity';
import { ErrorMessages } from '@app/common/config/error.constant';
import { PageOptionsDto } from '@app/common/dto/pagination/page-options.dto';
import { CreatePropertyDto } from '../dto/requests/create-property.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PropertyDto } from '../dto/responses/property-response.dto';
import { ClsService } from 'nestjs-cls';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { RequiredArgumentException } from '@app/common/exceptions/custom-exception';

@Injectable()
export class PropertiesService {
	private readonly logger = new Logger(PropertiesService.name);
	constructor(
		@InjectRepository(PropertyRepository)
		private readonly propertyRepository: PropertyRepository,
		private readonly cls: ClsService<SharedClsStore>,
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

	async createProperty(createDto: CreatePropertyDto) {
		try {
			const orgId = this.cls.get('orgId');
			if (!orgId)
				throw new ForbiddenException(ErrorMessages.NO_ORG_CREATE_PROPERTY);
			this.logger.verbose(`Creating new property`);
			createDto.isMultiUnit = createDto.units?.length > 0;
			const createdProperty = await this.propertyRepository.createProperty(
				createDto,
				orgId,
			);
			return this.mapper.map(createdProperty, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error creating Property Data', error);
			throw new BadRequestException(`Error creating New Property.`, {
				cause: new Error(),
				description: error.message,
			});
		}
	}

	/**
	 * Retrieves the properties of an organization.
	 *
	 * @param pageDto - Optional pagination options.
	 * @returns A promise that resolves to an array of Property objects.
	 */
	async getOrganizationProperties(pageDto?: PageOptionsDto) {
		try {
			const orgId = this.cls.get('orgId');
			if (!orgId) throw new RequiredArgumentException(['orgId']);
			this.logger.debug(
				`Getting all properties for ORG: ${orgId}. Skip: ${pageDto.skip}, Take: ${pageDto.take}`,
			);
			// const queryBuilder = this.propertyRepository.createQueryBuilder('property');
			// queryBuilder
			// 	.where('property.organizationUuid = :organizationUuid', { organizationUuid: orgId })
			// 	.orderBy('property.updatedDate', pageDto.order)
			// 	.skip(pageDto.skip)
			// 	.take(pageDto.take);
			// const itemCount = await queryBuilder.getCount();
			// const { entities } = await queryBuilder.getRawAndEntities();
			// const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: pageDto });
			// return new PageDto(entities, pageMetaDto);
			return await this.propertyRepository.getOrganizationProperties(
				orgId,
				pageDto,
			);
		} catch (error) {
			this.logger.error('Error retrieving organization properties', error);
			throw new Error(
				`Error retrieving organization properties. Error: ${error}`,
			);
		}
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
