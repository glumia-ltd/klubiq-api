import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
	PreconditionFailedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyRepository } from '../repositories/properties.repository';
import { Property } from '@app/common/database/entities/property.entity';
import { ErrorMessages } from '@app/common/config/error.constant';
import { CreatePropertyDto } from '../dto/requests/create-property.dto';
import {
	DeletePropertyDto,
	UpdatePropertyDto,
} from '../dto/requests/update-property.dto';
import { PropertyListDto } from '../dto/responses/property-list-response.dto';
import { ClsService } from 'nestjs-cls';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PageDto } from '@app/common/dto/pagination/page.dto';
import { PageMetaDto } from '@app/common/dto/pagination/page-meta.dto';
import { GetPropertyDto } from '../dto/requests/get-property.dto';
import { IPropertyMetrics } from '../interfaces/property-metrics.service.interface';
import { PropertyMetrics } from '@app/common/dto/responses/dashboard-metrics.dto';
import { CacheTTl, UserRoles } from '@app/common/config/config.constants';
import { Util } from '@app/common/helpers/util';
import { PropertyManagerAssignmentDto } from '../dto/requests/property-manager.dto';
import { CreateUnitDto } from '../dto/requests/create-unit.dto';
import { Unit } from '@app/common/database/entities/unit.entity';
import { plainToInstance } from 'class-transformer';
import { filter, padEnd, reduce } from 'lodash';
import {
	PropertyDetailsDto,
	UnitDto,
} from '../dto/responses/property-details.dto';
import { OrganizationSubscriptionService } from '@app/common/services/organization-subscription.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PropertyEvent } from '../../../../../libs/common/src/event-listeners/event-models/event-models';
import { CommonConfigService } from '@app/common/config/common-config';
import { PropertyAddress } from '@app/common';
import { DateTime } from 'luxon';

@Injectable()
export class PropertiesService implements IPropertyMetrics {
	private readonly logger = new Logger(PropertiesService.name);
	private readonly cacheKeyPrefix = 'properties';
	private readonly cacheTTL = 90;
	constructor(
		@InjectRepository(PropertyRepository)
		private readonly propertyRepository: PropertyRepository,
		private readonly cls: ClsService<SharedClsStore>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private readonly util: Util,
		private readonly organizationSubscriptionService: OrganizationSubscriptionService,
		private readonly eventEmitter: EventEmitter2,
		private readonly commonConfigService: CommonConfigService,
	) {}
	async getTotalUnits(organizationUuid: string): Promise<number> {
		try {
			return await this.propertyRepository.getTotalUnits(organizationUuid);
		} catch (error) {
			this.logger.error('Error getting total properties', error);
		}
	}
	async getTotalMaintenanceUnits(
		organizationUuid: string,
		days?: number,
	): Promise<number> {
		try {
			return await this.propertyRepository.getTotalUnitsInMaintenance(
				organizationUuid,
				days,
			);
		} catch (error) {
			this.logger.error('Error getting total maintenance properties', error);
		}
	}
	async getPropertyMetricsByOrganization(
		organizationUuid: string,
		daysAgo?: number,
	): Promise<PropertyMetrics> {
		try {
			const unitStatus =
				await this.propertyRepository.getUnitStatusCounts(organizationUuid);
			const unitStatusDaysAgo =
				await this.propertyRepository.getUnitStatusCounts(
					organizationUuid,
					daysAgo,
				);
			console.log('unitStatus', unitStatus);
			const occupiedUnits = unitStatus.occupied;
			const occupiedUnitsDaysAgo = unitStatusDaysAgo.occupied;
			const totalUnits = await this.getTotalUnits(organizationUuid);
			const maintenanceUnits =
				await this.getTotalMaintenanceUnits(organizationUuid);

			const maintenanceUnitsDaysAgo = await this.getTotalMaintenanceUnits(
				organizationUuid,
				daysAgo,
			);

			const occupancyRate =
				occupiedUnits > 0 && totalUnits > 0
					? await this.getOccupancyRate(occupiedUnits, totalUnits)
					: 0;
			const occupancyRateDaysAgo =
				occupiedUnitsDaysAgo > 0 && totalUnits > 0
					? await this.getOccupancyRate(occupiedUnitsDaysAgo, totalUnits)
					: 0;
			const propertyCountData =
				await this.propertyRepository.getPropertyCountDataInOrganization(
					organizationUuid,
				);
			//const rentOverdueData = await this.getTotalOverdueRents(organizationUuid);
			const propertyMetrics: PropertyMetrics = {
				vacantUnits: unitStatus.vacant,
				occupiedUnits,
				totalUnits,
				maintenanceUnits,
				occupancyRate,
				totalProperties: propertyCountData.totalProperties,
				multiUnits: propertyCountData.multiUnits,
				singleUnits: propertyCountData.singleUnits,
				occupancyRateLastMonth: occupancyRateDaysAgo,
				maintenanceUnitsLastMonth: maintenanceUnitsDaysAgo,
				//rentOverdue: rentOverdueData,
				occupancyRatePercentageDifference:
					occupancyRateDaysAgo > 0 && occupancyRate > 0
						? this.util.getPercentageIncreaseOrDecrease(
								occupiedUnitsDaysAgo,
								occupiedUnits,
							)
						: 0,
				occupancyRateChangeIndicator:
					occupancyRate > occupancyRateDaysAgo
						? 'positive'
						: occupancyRate < occupancyRateDaysAgo
							? 'negative'
							: 'neutral',
				maintenanceUnitsChangeIndicator:
					maintenanceUnitsDaysAgo > maintenanceUnits
						? 'positive'
						: maintenanceUnitsDaysAgo < maintenanceUnits
							? 'negative'
							: 'neutral',
				maintenanceUnitsPercentageDifference:
					maintenanceUnitsDaysAgo > 0 && maintenanceUnits > 0
						? this.util.getPercentageIncreaseOrDecrease(
								maintenanceUnitsDaysAgo,
								maintenanceUnits,
							)
						: 0,
			};
			return propertyMetrics;
		} catch (err) {
			this.logger.error(
				err.message,
				err.stack,
				`Error getting property metrics by organization`,
			);
			throw err;
		}
	}

	private async getOccupancyRate(
		occupiedUnits: number,
		totalUnits: number,
	): Promise<number> {
		try {
			return occupiedUnits / totalUnits;
		} catch (error) {
			this.logger.error('Error getting occupancy rate', error);
		}
	}

	private mapUnitsToUnitListDto(units: Unit[], groups?: string[]) {
		return plainToInstance(
			UnitDto,
			units.map((unit) => {
				return { ...unit };
			}),
			{ excludeExtraneousValues: true, groups },
		);
	}
	private async mapGroupedUnitsToPropertyListDto(
		plainProperty: Property[],
	): Promise<PropertyDetailsDto[]> {
		const propertyListDto = plainProperty.map(async (property) =>
			plainToInstance(
				PropertyDetailsDto,
				{
					uuid: property.uuid,
					name: property.name,
					units: await property.units,
				},
				{ excludeExtraneousValues: true },
			),
		);
		return Promise.all(propertyListDto);
	}
	private async mapPlainPropertyToPropertyListDto(
		plainProperty: Property[],
	): Promise<PropertyListDto[]> {
		return plainToInstance(
			PropertyListDto,
			plainProperty.map((property) => {
				const rooms = property.isMultiUnit ? null : property.mainUnit?.rooms;
				const offices = property.isMultiUnit
					? null
					: property.mainUnit?.offices;
				const floor = property.isMultiUnit ? null : property.mainUnit?.floor;
				const mainImage = property.mainPhoto;
				const bedrooms = property.isMultiUnit
					? null
					: property.mainUnit?.bedrooms;
				const bathrooms = property.isMultiUnit
					? null
					: property.mainUnit?.bathrooms;
				const toilets = property.isMultiUnit
					? null
					: property.mainUnit?.toilets;
				return {
					...property,
					mainImage,
					bedrooms,
					bathrooms,
					toilets,
					rooms,
					offices,
					floor,
				};
			}),
			{ excludeExtraneousValues: true },
		);
	}
	private async mapPlainPropertyDetailToDto(
		property: Property,
	): Promise<PropertyDetailsDto> {
		const units = await property.units;
		const images = await property.images;
		const totalRent = reduce(
			units,
			(sum, unit) =>
				sum +
				(unit?.leases?.reduce(
					(leaseSum, lease) => leaseSum + lease.rentAmount,
					0,
				) || 0),
			0,
		);
		const totalTenants = reduce(
			units,
			(sum, unit) =>
				sum +
				(unit?.leases?.reduce(
					(leaseSum, lease) => leaseSum + lease?.tenants?.length,
					0,
				) || 0),
			0,
		);
		// Calculate occupied unit count
		const occupiedUnitCount = filter(
			units,
			(unit) => unit?.leases?.length > 0,
		)?.length;
		const vacantUnitCount = property.unitCount - occupiedUnitCount;
		return plainToInstance(
			PropertyDetailsDto,
			{
				...property,
				totalRent: Number(totalRent).toFixed(2) || 0,
				occupiedUnitCount,
				vacantUnitCount,
				totalTenants,
				bedrooms: property.isMultiUnit ? null : units?.[0]?.bedrooms,
				bathrooms: property.isMultiUnit ? null : units?.[0]?.bathrooms,
				toilets: property.isMultiUnit ? null : units?.[0]?.toilets,
				units: units,
				images: images,
				area: property.isMultiUnit ? null : units?.[0]?.area,
			},
			{ excludeExtraneousValues: true, groups: ['private'] },
		);
	}

	private async updateOrgCacheKeys(cacheKey: string) {
		const currentUser = this.cls.get('currentUser');
		const propertyListKeys =
			(await this.cacheManager.get<string[]>(
				`${currentUser.organizationId}:getPropertyListKeys`,
			)) || [];
		await this.cacheManager.set(
			`${currentUser.organizationId}:getPropertyListKeys`,
			[...propertyListKeys, cacheKey],
			this.cacheTTL,
		);
	}
	/**
	 * Retrieves a property by its UUID from the current organization.
	 *
	 * @param {string} uuid - The UUID of the property to retrieve.
	 * @return {Promise<PropertyDto>} The property data as a PropertyDto object.
	 * @throws {ForbiddenException} If the current user does not have an organization ID.
	 * @throws {NotFoundException} If the property with the given UUID is not found.
	 * @throws {Error} If there is an error retrieving the property data.
	 */
	async getPropertyById(uuid: string): Promise<PropertyDetailsDto> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) {
				throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			}
			const cacheKey = `${this.cacheKeyPrefix}:${uuid}`;
			const cachedProperty =
				await this.cacheManager.get<PropertyDetailsDto>(cacheKey);
			if (cachedProperty) {
				return cachedProperty;
			}
			const property =
				await this.propertyRepository.getAPropertyInAnOrganization(
					currentUser.organizationId,
					currentUser.kUid,
					currentUser.organizationRole === UserRoles.ORG_OWNER,
					uuid,
				);
			const propertyDetails = await this.mapPlainPropertyDetailToDto(property);
			await this.cacheManager.set(cacheKey, propertyDetails, this.cacheTTL);
			await this.updateOrgCacheKeys(cacheKey);
			return propertyDetails;
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
	): Promise<PropertyDetailsDto> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			const property = await this.propertyRepository.updateProperty(
				uuid,
				currentUser.organizationId,
				currentUser.kUid,
				updateData,
				currentUser.organizationRole === UserRoles.ORG_OWNER,
			);
			this.eventEmitter.emit('property.updated', {
				organizationId: currentUser.organizationId,
				propertyId: uuid,
			} as PropertyEvent);
			return await this.mapPlainPropertyDetailToDto(property);
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
	async deleteProperty(deleteData: DeletePropertyDto): Promise<void> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			await this.propertyRepository.deleteProperty(
				deleteData.uuid,
				currentUser.organizationId,
				currentUser.kUid,
			);
			const deletedTime = DateTime.utc()
				.setZone(this.cls.get('clientTimeZoneName'))
				.toLocaleString(DateTime.DATETIME_FULL);
			this.eventEmitter.emit('property.deleted', {
				organizationId: currentUser.organizationId,
				propertyId: deleteData.uuid,
				name: deleteData.name,
				totalUnits: deleteData.unitCount || 1,
				propertyAddress: deleteData.address,
				propertyManagerName: currentUser.name,
				eventTimestamp: deletedTime,
			} as PropertyEvent);
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
				currentUser.kUid,
			);
			this.eventEmitter.emit('property.archived', {
				organizationId: currentUser.organizationId,
				propertyId: propertyUuid,
			} as PropertyEvent);
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
	async createProperty(
		createDto: CreatePropertyDto,
		isDraft = false,
	): Promise<PropertyDetailsDto> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) {
				throw new ForbiddenException(ErrorMessages.NO_ORG_CREATE_PROPERTY);
			}
			if (
				createDto.orgUuid &&
				createDto.orgUuid !== currentUser.organizationId
			) {
				throw new ForbiddenException(ErrorMessages.NO_ORG_CREATE_PROPERTY);
			}
			if (
				!this.commonConfigService.isDevelopmentEnvironment() &&
				!this.organizationSubscriptionService.canAddUnit(
					currentUser.organizationId,
					createDto.units?.length,
				)
			) {
				throw new PreconditionFailedException(ErrorMessages.UNIT_LIMIT_REACHED);
			}
			createDto?.isMultiUnit ?? createDto.units?.length > 1;
			createDto.orgUuid = currentUser.organizationId;
			if (!createDto.isMultiUnit) {
				createDto.units[0].unitNumber = padEnd(createDto.name, 4, '-1');
			}
			createDto.managerUid = currentUser.kUid;
			const createdProperty = await this.propertyRepository.createProperty(
				createDto,
				isDraft,
			);
			this.eventEmitter.emitAsync('property.created', {
				organizationId: currentUser.organizationId,
				name: createdProperty.name,
				totalUnits: createDto.units?.length || 1,
				propertyManagerId: createdProperty.manager?.profileUuid,
				propertyManagerEmail: currentUser.email,
				propertyId: createdProperty.uuid,
				propertyManagerName: currentUser.name,
				propertyAddress: this.getPropertyAddress(createdProperty.address),
			} as PropertyEvent);
			return await this.mapPlainPropertyDetailToDto(createdProperty);
		} catch (error) {
			this.logger.error('Error creating Property Data', error.message);
			throw new BadRequestException(`Error creating New Property.`, {
				cause: new Error(),
				description: error.message,
			});
		}
	}
	private getPropertyAddress(address: PropertyAddress): string {
		return address.isManualAddress
			? `${address.addressLine1}, ${address.addressLine2 ? `${address.addressLine2}, ` : ''}
		${address.city ? `${address.city} ` : ''} ${address.state ? `${address.state}, ` : ''} ${address.postalCode ? `${address.postalCode}, ` : ''}
		${address.country ? `${address.country}` : ''}`
			: `${address.addressLine2 ? `${address.addressLine2}, ` : ''}${address.addressLine1}`;
	}

	/**
	 * Retrieves all properties belonging to the organization.
	 *
	 * @param {PageOptionsDto} [pageDto] - Optional pagination parameters.
	 * @return {Promise<PageOptionsDto>} The properties belonging to the organization.
	 */
	async getOrganizationProperties(
		getPropertyDto?: GetPropertyDto,
	): Promise<PageDto<PropertyListDto>> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) {
				throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			}
			const cacheKey = `${this.cacheKeyPrefix}:${currentUser.organizationId}:${this.cls.get('requestUrl')}`;
			const cachedProperties =
				await this.cacheManager.get<PageDto<PropertyListDto>>(cacheKey);
			if (cachedProperties) {
				return cachedProperties;
			}
			const [entities, count] =
				await this.propertyRepository.getOrganizationProperties(
					currentUser.organizationId,
					currentUser.kUid,
					currentUser.organizationRole === UserRoles.ORG_OWNER,
					getPropertyDto,
				);
			const pageMetaDto = new PageMetaDto({
				itemCount: count,
				pageOptionsDto: getPropertyDto,
			});
			const mappedEntities =
				await this.mapPlainPropertyToPropertyListDto(entities);
			const propertiesPageData = new PageDto(mappedEntities, pageMetaDto);
			await this.cacheManager.set(cacheKey, propertiesPageData, this.cacheTTL);
			await this.updateOrgCacheKeys(cacheKey);
			return propertiesPageData;
		} catch (error) {
			this.logger.error('Error retrieving organization properties', error);
			throw new Error(
				`Error retrieving organization properties. Error: ${error}`,
			);
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
		unitsDto: CreateUnitDto[],
	): Promise<Unit[]> {
		try {
			const orgId = this.cls.get('currentUser').organizationId;
			if (!orgId) {
				throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			}
			if (
				!this.commonConfigService.isDevelopmentEnvironment() &&
				!this.organizationSubscriptionService.canAddUnit(orgId, unitsDto.length)
			)
				throw new PreconditionFailedException(ErrorMessages.UNIT_LIMIT_REACHED);
			return await this.propertyRepository.addUnitsToAProperty(
				propertyUuid,
				unitsDto,
			);
		} catch (error) {
			this.logger.error('Error adding Unit to Property', error);
			throw new BadRequestException(`Error adding Unit to Property.`, {
				cause: new Error(),
				description: error.message,
			});
		}
	}

	async assignPropertyToManagerOrOwner(
		propertyUuid: string,
		managerDto: PropertyManagerAssignmentDto,
	): Promise<boolean> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser.organizationId) {
				throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			}
			const assigned =
				await this.propertyRepository.assignPropertyToManagerOrOwner(
					propertyUuid,
					currentUser.organizationId,
					managerDto,
				);
			const eventTimestamp = DateTime.utc()
				.setZone(this.cls.get('clientTimeZoneName'))
				.toLocaleString(DateTime.DATETIME_FULL);
			this.eventEmitter.emit('property.deleted', {
				organizationId: currentUser.organizationId,
				propertyId: propertyUuid,
				propertyManagerName: currentUser.name,
				name: managerDto.propertyName,
				propertyAddress: managerDto.propertyAddress,
				eventTimestamp,
			} as PropertyEvent);
			return assigned;
		} catch (error) {
			const logMessage = `Error assigning property ${propertyUuid} to ${managerDto.isPropertyOwner ? 'owner' : 'manager'}`;
			this.logger.error(error.message, logMessage, error);
			throw new BadRequestException(logMessage, {
				cause: new Error(),
				description: error.message,
			});
		}
	}

	/**
	 * Deletes the specified units from a property.
	 *
	 * @param {number[]} unitIds - The IDs of the units to delete.
	 * @param {string} propertyUuid - The UUID of the property to delete the units from.
	 * @return {Promise<void>} A promise that resolves when the units are successfully deleted.
	 * @throws {ForbiddenException} - If the current user's organization ID is not found in the context.
	 * @throws {BadRequestException} - If there is an error deleting the units from the property.
	 */
	async deleteUnitsFromProperty(
		unitIds: number[],
		propertyUuid: string,
	): Promise<void> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser.organizationId) {
				throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			}
			await this.propertyRepository.deleteUnits(
				unitIds,
				currentUser.organizationId,
				propertyUuid,
				currentUser.kUid,
				currentUser.organizationRole === UserRoles.ORG_OWNER,
			);
		} catch (error) {
			this.logger.error('Error deleting Units from Property', error);
			throw new BadRequestException(`Error deleting Units from Property.`, {
				cause: new Error(),
				description: error.message,
			});
		}
	}

	/**
	 * Retrieves all properties belonging to the organization grouped by property and units.
	 * @return {Promise<PropertyDetailsDto[]>} - The properties belonging to the organization grouped by property and units.
	 * @throws {ForbiddenException} - If the current user's organization ID is not found in the context.
	 */
	async getPropertyGroupedUnitsByOrganization(): Promise<PropertyDetailsDto[]> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser.organizationId) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		const cacheKey = `${this.cacheKeyPrefix}:grouped-units:${currentUser.organizationId}`;
		const cachedProperties =
			await this.cacheManager.get<PropertyDetailsDto[]>(cacheKey);
		if (cachedProperties) {
			return cachedProperties;
		}
		const properties =
			await this.propertyRepository.getPropertyGroupedUnitsByOrganization(
				currentUser.organizationId,
			);
		const mappedProperties =
			await this.mapGroupedUnitsToPropertyListDto(properties);
		await this.cacheManager.set(cacheKey, mappedProperties, CacheTTl.ONE_DAY);
		return mappedProperties;
	}
}
