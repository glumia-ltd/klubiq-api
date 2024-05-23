import {
	BadRequestException,
	ForbiddenException,
	Inject,
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PageDto } from '@app/common/dto/pagination/page.dto';
import { PageMetaDto } from '@app/common/dto/pagination/page-meta.dto';

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
	 * Retrieves a property by its UUID.
	 *
	 * @param {string} uuid - The UUID of the property to retrieve.
	 * @return {Promise<Property>} A promise that resolves to the retrieved property.
	 * @throws {ForbiddenException} If the organization ID is not found in the context.
	 * @throws {NotFoundException} If the property with the given UUID is not found.
	 * @throws {Error} If there is an error retrieving the property data.
	 */
	async getPropertyById(uuid: string): Promise<PropertyDto> {
		try {
			const orgId = this.cls.get('currentUser').organizationId;
			if (!orgId) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			this.logger.verbose(`Getting property by id: ${uuid}`);
			const property =
				await this.propertyRepository.getAPropertyInAnOrganization(orgId, uuid);
			//.findOneBy({ id: id });
			if (!property) {
				throw new NotFoundException('Property not found');
			}
			return await this.mapper.mapAsync(property, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error getting Property Data', error);
			throw new Error(`Error getting Property Data. Error: ${error}`);
		}
	}

	async updateProperty(id: number, updateData: UpdatePropertyDto) {
		try {
			this.logger.verbose(`Updating property data by Id: ${id}`);
			const property = await this.propertyRepository.findOneBy({ id: id });
			Object.assign(property, updateData);
			const updatedProp = await this.propertyRepository.save(property);
			return this.mapper.map(updatedProp, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error updating Property Data', error);
			return new Error(`Error updating Property Data. Error: ${error}`);
		}
	}

	async deleteProperty(uuid: string): Promise<void> {
		try {
			const orgId = this.cls.get('currentUser').organizationId;
			if (!orgId) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			this.logger.verbose(`Deleting Property by id: ${uuid}`);
			await this.propertyRepository.deleteProperty(uuid, orgId);
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
			const orgId = this.cls.get('currentUser').organizationId;
			if (!orgId) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			this.logger.verbose(`Archiving Property by id: ${propertyUuid}`);
			await this.propertyRepository.archiveProperty(propertyUuid, orgId);
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
			const orgId = this.cls.get('currentUser').organizationId;
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
	 * Retrieves all properties belonging to the organization.
	 *
	 * @param {PageOptionsDto} [pageDto] - Optional pagination parameters.
	 * @return {Promise<PageOptionsDto>} The properties belonging to the organization.
	 */
	async getOrganizationProperties(
		pageDto?: PageOptionsDto,
	): Promise<PageDto<PropertyDto>> {
		try {
			const orgId = this.cls.get('currentUser').organizationId;
			if (!orgId) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			this.logger.debug(
				`Getting all properties for ORG: ${orgId}. Skip: ${pageDto.skip}, Take: ${pageDto.take}`,
			);
			const cachedProperties = await this.cacheManager.get<
				PageDto<PropertyDto>
			>(`${this.cacheKeyPrefix}.${orgId}.${pageDto.skip}.${pageDto.take}`);
			if (cachedProperties) {
				return cachedProperties;
			}
			const [entities, count] =
				await this.propertyRepository.getOrganizationProperties(orgId, pageDto);
			const pageMetaDto = new PageMetaDto({
				itemCount: count,
				pageOptionsDto: pageDto,
			});
			const mappedEntities = await this.mapper.mapArrayAsync(
				entities,
				Property,
				PropertyDto,
			);
			const propertiesPageData = new PageDto(mappedEntities, pageMetaDto);
			await this.cacheManager.set(
				`${this.cacheKeyPrefix}.${orgId}.${pageDto.skip}.${pageDto.take}`,
				propertiesPageData,
				this.cacheTTL,
			);
			return propertiesPageData;
		} catch (error) {
			this.logger.error('Error retrieving organization properties', error);
			throw new Error(
				`Error retrieving organization properties. Error: ${error}`,
			);
		}
	}

	/**
	 * Retrieves all properties that match the given filter, paginated based on the provided page options.
	 *
	 * @param {any} filter - The filter to apply to the properties.
	 * @param {PageOptionsDto} [pageDto] - The pagination options for the properties.
	 * @return {Promise<Property[]>} A promise that resolves to an array of Property objects.
	 */
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
			const orgId = this.cls.get('currentUser').organizationId;
			if (!orgId) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			this.logger.verbose(`Creating draft property`);
			createDto.isMultiUnit = createDto.units?.length > 0;
			const draftProperty = await this.propertyRepository.createProperty(
				createDto,
				orgId,
				true,
			);
			return this.mapper.map(draftProperty, Property, PropertyDto);
		} catch (error) {
			this.logger.error('Error creating draft Property Data', error);
			throw new BadRequestException(`Error creating draft Property.`, {
				cause: new Error(),
				description: error.message,
			});
		}
	}

	async saveDraftProperty(propertyUuid: string): Promise<void> {
		try {
			const orgId = this.cls.get('currentUser').organizationId;
			if (!orgId) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			this.logger.verbose(`Saving draft property`);
			await this.propertyRepository.saveDraftProperty(propertyUuid, orgId);
		} catch (error) {
			this.logger.error('Error saving draft Property', error);
			throw new BadRequestException(`Error saving draft Property.`, {
				cause: new Error(),
				description: error.message,
			});
		}
	}
}
