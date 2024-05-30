import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyRepository } from '../repositories/properties.repository';
import { Property } from '../entities/property.entity';
import { ErrorMessages } from '@app/common/config/error.constant';
import { CreatePropertyDto } from '../dto/requests/create-property.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PropertyDto } from '../dto/responses/property-response.dto';
import { ClsService } from 'nestjs-cls';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PageDto } from '@app/common/dto/pagination/page.dto';
import { PageMetaDto } from '@app/common/dto/pagination/page-meta.dto';
import { GetPropertyDto } from '../dto/requests/get-property.dto';

@Injectable()
export class PropertiesService {
	private readonly logger = new Logger(PropertiesService.name);
	private readonly cacheKeyPrefix = 'properties';
	private readonly cacheTTL = 60000;
	constructor(
		@InjectRepository(PropertyRepository)
		private readonly propertyRepository: PropertyRepository,
		private readonly cls: ClsService<SharedClsStore>,
		@InjectMapper() private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	/**
	 * Retrieves a property by its UUID from the current organization.
	 *
	 * @param {string} uuid - The UUID of the property to retrieve.
	 * @return {Promise<PropertyDto>} The property data as a PropertyDto object.
	 * @throws {ForbiddenException} If the current user does not have an organization ID.
	 * @throws {NotFoundException} If the property with the given UUID is not found.
	 * @throws {Error} If there is an error retrieving the property data.
	 */
	async getPropertyById(uuid: string): Promise<PropertyDto> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			const cacheKey = `${currentUser.uid}.${uuid}`;
			const cachedProperty = await this.cacheManager.get<PropertyDto>(cacheKey);
			if (cachedProperty) return cachedProperty;
			const property =
				await this.propertyRepository.getAPropertyInAnOrganization(
					currentUser.organizationId,
					currentUser.uid,
					uuid,
				);
			await this.cacheManager.set(cacheKey, property, this.cacheTTL);
			return await this.mapper.mapAsync(property, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error getting Property Data', error);
			throw new Error(`Error getting Property Data. Error: ${error}`);
		}
	}

	/**
	 * Updates a property with the given UUID using the provided data.
	 *
	 * @param {string} uuid - The UUID of the property to be updated.
	 * @param {UpdatePropertyDto} updateData - The data to update the property with.
	 * @return {Promise<PropertyDto>} - The updated property.
	 * @throws {ForbiddenException} - If the current user's organization ID is not found in the context.
	 * @throws {Error} - If there is an error updating the property data.
	 */
	async updateProperty(
		uuid: string,
		updateData: UpdatePropertyDto,
	): Promise<PropertyDto> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			const property = await this.propertyRepository.updateProperty(
				uuid,
				currentUser.organizationId,
				currentUser.uid,
				updateData,
			);
			return this.mapper.map(property, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error updating Property Data', error);
			throw new Error(`Error updating Property Data. Error: ${error}`);
		}
	}

	/**
	 * Deletes a property with the given UUID from the current organization.
	 *
	 * @param {string} uuid - The UUID of the property to be deleted.
	 * @return {Promise<void>} A promise that resolves when the property is successfully deleted, or rejects with an error if there was an issue.
	 * @throws {ForbiddenException} If the current user's organization ID is not found in the context.
	 * @throws {Error} If there is an error deleting the property data.
	 */
	async deleteProperty(uuid: string): Promise<void> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			await this.propertyRepository.deleteProperty(
				uuid,
				currentUser.organizationId,
				currentUser.uid,
			);
		} catch (error) {
			this.logger.error('Error deleting Property Data', error);
			throw new Error(`Error deleting Property Data. Error: ${error}`);
		}
	}

	/**
	 * Archives a property by its UUID.
	 *
	 * @param {string} propertyUuid - The UUID of the property to be archived.
	 * @return {Promise<void>} A promise that resolves when the property is successfully archived, or rejects with an error if there was an issue.
	 * @throws {ForbiddenException} If the current user's organization ID is not found in the context.
	 */
	async archiveProperty(propertyUuid: string): Promise<void> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			await this.propertyRepository.archiveProperty(
				propertyUuid,
				currentUser.organizationId,
				currentUser.uid,
			);
		} catch (error) {
			this.logger.error('Error archiving Property Data', error);
			throw Error(`Error archiving Property Data. Error: ${error}`);
		}
	}

	/**
	 * Creates a new property.
	 *
	 * @param {CreatePropertyDto} createDto - The data for creating the property.
	 * @return {Promise<PropertyDto>} The created property.
	 */
	async createProperty(createDto: CreatePropertyDto): Promise<PropertyDto> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser)
				throw new ForbiddenException(ErrorMessages.NO_ORG_CREATE_PROPERTY);
			createDto.isMultiUnit = createDto.units?.length > 0;
			createDto.orgUuid = currentUser.organizationId;
			createDto.ownerUid = currentUser.uid;
			const createdProperty =
				await this.propertyRepository.createProperty(createDto);
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
	 * Retrieves all properties belonging to the organization.
	 *
	 * @param {PageOptionsDto} [pageDto] - Optional pagination parameters.
	 * @return {Promise<PageOptionsDto>} The properties belonging to the organization.
	 */
	async getOrganizationProperties(
		getPropertyDto?: GetPropertyDto,
	): Promise<PageDto<PropertyDto>> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			const cacheKey = `${currentUser.uid}/${this.cls.get('requestUrl')}`;
			const cachedProperties =
				await this.cacheManager.get<PageDto<PropertyDto>>(cacheKey);
			if (cachedProperties) return cachedProperties;
			const [entities, count] =
				await this.propertyRepository.getOrganizationProperties(
					currentUser.organizationId,
					currentUser.uid,
					getPropertyDto,
				);
			const pageMetaDto = new PageMetaDto({
				itemCount: count,
				pageOptionsDto: getPropertyDto,
			});
			const mappedEntities = await this.mapper.mapArrayAsync(
				entities,
				Property,
				PropertyDto,
			);
			const propertiesPageData = new PageDto(mappedEntities, pageMetaDto);
			await this.cacheManager.set(cacheKey, propertiesPageData, this.cacheTTL);
			return propertiesPageData;
		} catch (error) {
			this.logger.error('Error retrieving organization properties', error);
			throw new Error(
				`Error retrieving organization properties. Error: ${error}`,
			);
		}
	}

	/**
	 * Creates a draft property using the provided CreatePropertyDto.
	 *
	 * @param {CreatePropertyDto} createDto - The data for creating the draft property.
	 * @return {Promise<PropertyDto>} - The created draft property.
	 * @throws {ForbiddenException} - If no organization ID is found in the context.
	 * @throws {BadRequestException} - If there is an error creating the draft property.
	 */
	async createDraftProperty(
		createDto: CreatePropertyDto,
	): Promise<PropertyDto> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser)
				throw new ForbiddenException(ErrorMessages.NO_ORG_CREATE_PROPERTY);
			createDto.isMultiUnit = createDto.units?.length > 0;
			createDto.orgUuid = currentUser.organizationId;
			createDto.ownerUid = currentUser.uid;
			const draftProperty = await this.propertyRepository.createProperty(
				createDto,
				true,
			);
			console.log('Draft: ', draftProperty);
			return this.mapper.map(draftProperty, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error creating draft Property Data', error.message);
			throw new BadRequestException(`Error creating draft Property.`, {
				cause: new Error(),
				description: error.message,
			});
		}
	}

	/**
	 * Saves a draft property with the specified UUID.
	 *
	 * @param {string} propertyUuid - The UUID of the property to save as a draft.
	 * @return {Promise<void>} - A promise that resolves when the draft property is saved successfully.
	 * @throws {ForbiddenException} - If no organization ID is found in the context.
	 * @throws {BadRequestException} - If there is an error saving the draft property.
	 */
	async saveDraftProperty(propertyUuid: string): Promise<void> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			await this.propertyRepository.saveDraftProperty(
				propertyUuid,
				currentUser.organizationId,
				currentUser.uid,
			);
		} catch (error) {
			this.logger.error('Error saving draft Property', error);
			throw new BadRequestException(`Error saving draft Property.`, {
				cause: new Error(),
				description: error.message,
			});
		}
	}

	/**
	 * Adds units to a property.
	 *
	 * @param {string} propertyUuid - The UUID of the property to add units to.
	 * @param {CreatePropertyDto[]} unitsDto - An array of CreatePropertyDto objects representing the units to add.
	 * @return {Promise<PropertyDto[]>} A promise that resolves to an array of PropertyDto objects representing the added units.
	 * @throws {ForbiddenException} If the current user does not have an organization ID.
	 * @throws {BadRequestException} If there is an error adding the units to the property.
	 */
	async addUnitsToProperty(
		propertyUuid: string,
		unitsDto: CreatePropertyDto[],
	): Promise<PropertyDto[]> {
		try {
			const orgId = this.cls.get('currentUser').organizationId;
			if (!orgId) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			const units = await this.propertyRepository.addUnitsToAProperty(
				propertyUuid,
				orgId,
				unitsDto,
			);
			return await this.mapper.mapArrayAsync(units, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error adding Unit to Property', error);
			throw new BadRequestException(`Error adding Unit to Property.`, {
				cause: new Error(),
				description: error.message,
			});
		}
	}
}
