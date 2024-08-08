import { Injectable, Logger } from '@nestjs/common';
import {
	Amenity,
	BaseRepository,
	LeaseStatus,
	MaintenanceStatus,
	RentOverdueLeaseDto,
	RevenueType,
	TransactionType,
} from '@app/common';
import { Brackets, EntityManager, SelectQueryBuilder } from 'typeorm';
import { Property } from '../entities/property.entity';
import {
	AmenityDto,
	CreatePropertyDto,
	CreatePropertyUnitDto,
} from '../dto/requests/create-property.dto';
import { CreateAddressDto } from '../dto/requests/create-address.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import {
	DisplayOptions,
	GetPropertyDto,
	PropertyFilterDto,
	UnitType,
} from '../dto/requests/get-property.dto';
import { indexOf } from 'lodash';
import { DateTime } from 'luxon';
import { PropertyCountData } from '../dto/responses/property-count.dto';
import { PropertyManagerDto } from '../dto/requests/property-manager.dto';

@Injectable()
export class PropertyRepository extends BaseRepository<Property> {
	protected readonly logger = new Logger(PropertyRepository.name);
	private readonly timestamp = DateTime.utc().toSQL({ includeOffset: false });
	private daysAgo = (days: number) =>
		DateTime.utc().minus({ days }).toSQL({ includeOffset: false });
	private readonly nonFilterColumns = [
		'skip',
		'take',
		'order',
		'sortBy',
		'page',
		'display',
		'unitType',
	];
	constructor(manager: EntityManager) {
		super(Property, manager);
	}

	async assignPropertyToManagerOrOwner(
		propertyUuid: string,
		orgId: string,
		managerDto: PropertyManagerDto,
	) {
		try {
			const update = await this.createQueryBuilder('property')
				.update(Property)
				.set({
					manager: managerDto.isPropertyOwner
						? null
						: { firebaseId: managerDto.uid },
					owner: managerDto.isPropertyOwner
						? { firebaseId: managerDto.uid }
						: null,
				})
				.where('uuid = :propertyUuid', { propertyUuid })
				.andWhere('organizationId = :orgId', { orgId })
				.execute();
			return update.affected > 0;
		} catch (err) {
			this.logger.error(err, `Error assigning property to manager`);
			throw err;
		}
	}
	///
	/// CREATES PROPERTY RECORD
	///
	async createProperty(
		createData: CreatePropertyDto,
		isDraft: boolean = false,
	) {
		try {
			let createdProperty: Property;
			let propertyUnits: Property[] = [];
			await this.manager.transaction(async (transactionalEntityManager) => {
				createdProperty = transactionalEntityManager.create(Property, {
					name: createData.name,
					description: createData.description ?? null,
					isMultiUnit: createData.isMultiUnit,
					isDraft: isDraft,
					tags: createData.tags ?? null,
					bedroom: createData.bedroom ?? null,
					bathroom: createData.bathroom ?? null,
					toilet: createData.toilet ?? null,
					area: createData.area ?? null,
					address: createData.address,
					images: createData.images ?? null,
					unitCount: createData.isMultiUnit ? 0 : 1,
					organization: {
						organizationUuid: createData.orgUuid,
					},
					owner: createData.ownerUid
						? {
								firebaseId: createData.ownerUid,
							}
						: null,
					manager: createData.managerUid
						? {
								firebaseId: createData.managerUid,
							}
						: null,
					purpose: createData.purposeId
						? {
								id: createData.purposeId,
							}
						: null,
					type: createData.typeId
						? {
								id: createData.typeId,
							}
						: null,
					category: createData.categoryId
						? {
								id: createData.categoryId,
							}
						: null,
				});
				if (createData.amenities?.length > 0) {
					createdProperty.amenities = await this.addAmenities(
						createData.amenities,
					);
				}
				await transactionalEntityManager.save(createdProperty);
				if (createData.isMultiUnit) {
					propertyUnits = await this.addUnitsToProperty(
						createData.units,
						transactionalEntityManager,
						createdProperty,
						createData.address,
					);
				}
			});
			return { ...createdProperty, units: [...propertyUnits] } as Property;
		} catch (err) {
			this.logger.error(err.message, err, 'Error creating new property');
			throw err.message;
		}
	}

	private async addAmenities(amenities: AmenityDto[]): Promise<Amenity[]> {
		const propertyAmenities: Amenity[] = [];
		amenities.map((data) => {
			if (data.id) {
				propertyAmenities.push({
					id: data.id,
					name: data.name,
				});
			} else {
				propertyAmenities.push({
					name: data.name,
				});
			}
		});
		return propertyAmenities;
	}

	private async addUnitsToProperty(
		unitsToCreate: CreatePropertyUnitDto[],
		manager: EntityManager,
		property: Property,
		address: CreateAddressDto,
	): Promise<Property[]> {
		const units = unitsToCreate.map((unit) => {
			return {
				...unit,
				unitCount: 1,
				organization: property.organization,
				owner: property.owner,
				isDraft: property.isDraft,
				parentProperty: property,
				address: { ...address, unit: unit.name },
			} as Property;
		});
		return await manager.save(Property, units);
	}

	async getOrganizationProperties(
		orgUuid: string,
		userId: string,
		isOrgOwner: boolean,
		getPropertyDto?: GetPropertyDto,
	): Promise<[Property[], number]> {
		try {
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.leftJoinAndSelect('property.purpose', 'pp')
				.leftJoinAndSelect('property.type', 'pt')
				.leftJoinAndSelect('property.category', 'pc')
				.leftJoinAndMapOne(
					'property.mainPhoto',
					'property.images',
					'pi',
					'pi.isMain = TRUE',
				)
				.leftJoinAndSelect('property.address', 'pa')
				.where('property.organizationUuid = :organizationUuid', {
					organizationUuid: orgUuid,
				})
				.andWhere('property.parentProperty IS NULL');
			if (!isOrgOwner) {
				queryBuilder.andWhere(
					new Brackets((qb) => {
						qb.where('property.ownerUid = :ownerUid', {
							ownerUid: userId,
						}).orWhere('property.managerUid = :managerUid', {
							managerUid: userId,
						});
					}),
				);
			}
			await this.getPropertiesFilterQueryString(getPropertyDto, queryBuilder);
			queryBuilder
				.orderBy(`property.${getPropertyDto.sortBy}`, getPropertyDto.order)
				.skip(getPropertyDto.skip)
				.take(getPropertyDto.take);
			return await queryBuilder.getManyAndCount();
		} catch (err) {
			this.logger.error(err, `Error getting properties for Org: ${orgUuid}`);
			throw err;
		}
	}
	private async getPropertiesFilterQueryString(
		filterDto: PropertyFilterDto,
		queryBuilder: SelectQueryBuilder<Property>,
	) {
		if (filterDto) {
			Object.keys(filterDto).forEach((key) => {
				const value = filterDto[key];
				if (typeof value !== 'undefined' && value !== null) {
					if (key === 'search') {
						queryBuilder.andWhere(`property.name LIKE :${key}`, {
							[key]: `%${value}%`,
						});
					} else if (key === 'display') {
						queryBuilder.andWhere(`property.isArchived = :${key}`, {
							[key]: value === DisplayOptions.ARCHIVED ? true : false,
						});
					} else if (key === 'unitType') {
						queryBuilder.andWhere(`property.isMultiUnit = :${key}`, {
							[key]: value === UnitType.MULTI_UNIT ? true : false,
						});
					} else if (indexOf(this.nonFilterColumns, key) < 0) {
						queryBuilder.andWhere(`property.${key} = :${key}`, {
							[key]: value,
						});
					}
				}
			});
		}
	}

	async getAPropertyInAnOrganization(
		orgUuid: string,
		userId: string,
		isOrgOwner: boolean,
		propertyUuid: string,
	) {
		try {
			const propertyData = this.createQueryBuilder('property')
				.leftJoinAndSelect('property.purpose', 'pp')
				.leftJoinAndSelect('property.status', 'ps')
				.leftJoinAndSelect('property.type', 'pt')
				.leftJoinAndSelect('property.category', 'pc')
				.leftJoinAndSelect('property.images', 'pi')
				.leftJoinAndSelect('property.address', 'pa')
				.leftJoinAndSelect('property.amenities', 'pf')
				.leftJoinAndSelect('property.manager', 'pm')
				.leftJoinAndSelect('property.owner', 'po')
				.leftJoinAndSelect('property.leases', 'pl', 'pl.endDate >= NOW()')
				.leftJoinAndSelect('pl.tenants', 'property_tenants')
				.leftJoinAndSelect('property.units', 'units')
				.leftJoinAndSelect('units.status', 'unitStatus')
				.leftJoinAndSelect('units.manager', 'unitManager')
				.leftJoinAndSelect('units.images', 'unitImages')
				.leftJoinAndSelect(
					'units.leases',
					'unitLeases',
					'unitLeases.endDate >= NOW()',
				)
				.leftJoinAndSelect('unitLeases.tenants', 'lease_tenants');
			// if (isMultiUnit) {
			// 	propertyData

			// 	//.addSelect('COALESCE(SUM(CASE WHEN COUNT(unitLeases.id) > 0 THEN 1 ELSE 0 END),0)', 'occupiedUnits')
			// 	//.addSelect('IFNULL(SUM(unitLeases.rentAmount), 0)', 'totalRent')
			// 	//.addSelect('COALESCE(SUM(COUNT(DISTINCT tenants.profileId)), 0)', 'totalTenants');
			// } else {
			// 	propertyData

			// 	// .addSelect('CASE WHEN COUNT(pl.id) > 0 THEN 1 ELSE 0 END', 'occupiedUnits')
			// 	// .addSelect('COALESCE(SUM(pl.rentAmount), 0)', 'totalRent')
			// 	// .addSelect('COALESCE(COUNT(DISTINCT tenants.profileId), 0)', 'totalTenants');
			// }
			// //propertyData.addSelect('property.unitCount - property.occupiedUnits', 'availableUnits');
			propertyData
				.where('property.uuid = :propertyUuid', {
					propertyUuid: propertyUuid,
				})
				.andWhere('property.organizationUuid = :organizationUuid', {
					organizationUuid: orgUuid,
				});
			if (!isOrgOwner) {
				propertyData.andWhere(
					new Brackets((qb) => {
						qb.where('property.ownerUid = :ownerUid', {
							ownerUid: userId,
						}).orWhere('property.managerUid = :managerUid', {
							managerUid: userId,
						});
					}),
				);
			}

			const property = await propertyData.getOne();
			property.occupiedUnits = 0;
			property.totalRent = 0;
			property.totalTenants = 0;
			return property;
		} catch (err) {
			this.logger.error(err, `Error getting a property for Org: ${orgUuid}`);
			throw err;
		}
	}
	async saveDraftProperty(
		propertyUuid: string,
		orgUuid: string,
		userId: string,
	) {
		try {
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.update(Property)
				.set({ isDraft: false })
				.where('uuid = :propertyUuid', { propertyUuid })
				.orWhere('parentPropertyUuid = :propertyUuid', { propertyUuid })
				.andWhere('organizationUuid = :orgUuid', { orgUuid })
				.andWhere(
					new Brackets((qb) => {
						qb.where('property.ownerUid = :ownerUid', { ownerUid: userId })
							.orWhere('property.managerUid = :managerUid', {
								managerUid: userId,
							})
							.orWhere(
								'property.ownerUid IS NULL AND property.managerUid IS NULL',
							);
					}),
				)
				.execute();
		} catch (err) {
			this.logger.error(
				err,
				`Error saving a draft property for Org: ${orgUuid}`,
			);
			throw err;
		}
	}

	async archiveProperty(propertyUuid: string, orgUuid: string, userId: string) {
		try {
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.update(Property)
				.set({ isArchived: true, archivedDate: new Date() })
				.where('uuid = :propertyUuid', { propertyUuid })
				.orWhere('parentPropertyUuid = :propertyUuid', { propertyUuid })
				.andWhere('organizationUuid = :orgUuid', { orgUuid })
				.andWhere(
					new Brackets((qb) => {
						qb.where('property.ownerUid = :ownerUid', { ownerUid: userId })
							.orWhere('property.managerUid = :managerUid', {
								managerUid: userId,
							})
							.orWhere(
								'property.ownerUid IS NULL AND property.managerUid IS NULL',
							);
					}),
				)
				.execute();
		} catch (err) {
			this.logger.error(err, `Error archiving a property for Org: ${orgUuid}`);
			throw err;
		}
	}

	async deleteProperty(propertyUuid: string, orgUuid: string, userId: string) {
		try {
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.softDelete()
				.where('uuid = :propertyUuid', { propertyUuid })
				.orWhere('parentPropertyUuid = :propertyUuid', { propertyUuid })
				.andWhere('organizationUuid = :orgUuid', { orgUuid })
				.andWhere(
					new Brackets((qb) => {
						qb.where('property.ownerUid = :ownerUid', { ownerUid: userId })
							.orWhere('property.managerUid = :managerUid', {
								managerUid: userId,
							})
							.orWhere(
								'property.ownerUid IS NULL AND property.managerUid IS NULL',
							);
					}),
				)
				.execute();
		} catch (err) {
			this.logger.error(err, `Error deleting a property from Org: ${orgUuid}`);
			throw err;
		}
	}

	async updateProperty(
		propertyUuid: string,
		orgUuid: string,
		userId: string,
		data: UpdatePropertyDto,
		isOrgOwner: boolean,
	) {
		try {
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.update(Property)
				.set(data)
				.where('uuid = :propertyUuid', { propertyUuid })
				.andWhere('organizationUuid = :orgUuid', { orgUuid })
				.andWhere(
					new Brackets((qb) => {
						qb.where('property.ownerUid = :ownerUid', { ownerUid: userId })
							.orWhere('property.managerUid = :managerUid', {
								managerUid: userId,
							})
							.orWhere(
								'property.ownerUid IS NULL AND property.managerUid IS NULL',
							);
					}),
				)
				.execute();
			return await this.getAPropertyInAnOrganization(
				orgUuid,
				userId,
				isOrgOwner,
				propertyUuid,
			);
		} catch (err) {
			this.logger.error(err, `Error updating a property from Org: ${orgUuid}`);
			throw err;
		}
	}

	async addUnitsToAProperty(
		propertyUuid: string,
		orgUuid: string,
		data: CreatePropertyUnitDto[],
	): Promise<Property[]> {
		try {
			let propertyUnits: Property[] = [];
			await this.manager.transaction(async (transactionalEntityManager) => {
				const property = await transactionalEntityManager.findOne(Property, {
					where: { uuid: propertyUuid },
				});
				propertyUnits = await this.addUnitsToProperty(
					data,
					transactionalEntityManager,
					property,
					property.address,
				);
			});
			return propertyUnits;
		} catch (err) {
			this.logger.error(err, `Error updating a property from Org: ${orgUuid}`);
			throw err;
		}
	}

	async getTotalUnits(orgUuid: string): Promise<number> {
		try {
			const totalUnitsQuery = await this.manager.query(
				`
				SELECT 
					P."organizationUuid" AS org_uuid,
					SUM(P."unitCount") AS total_units
				FROM poo.property P
				WHERE (P."organizationUuid" = '${orgUuid}' AND P."isArchived" = false AND P."deletedDate" IS NULL AND P."parentPropertyUuid" IS NULL)
				GROUP BY P."organizationUuid"
			`,
			);
			const queryResult = totalUnitsQuery.length
				? parseInt(totalUnitsQuery[0].total_units, 10)
				: 0;
			return queryResult;
		} catch (err) {
			this.logger.error(err.message, `Error getting total units in Org`);
			throw err;
		}
	}

	async getTotalOccupiedUnits(
		organizationUuid: string,
		pastDays: number = 0,
	): Promise<number> {
		try {
			const occupiedUnitsQuery = await this.manager.query(
				`SELECT COUNT(DISTINCT "property"."uuid") AS "total_occupied_units", "property"."organizationUuid" AS "org_uuid"
 					FROM "poo"."property" "property"
 					INNER JOIN "poo"."lease" "pl" ON "pl"."propertyUuId"="property"."uuid" AND ("pl"."deletedAt" IS NULL)
 					WHERE (
						 "property"."organizationUuid" = '${organizationUuid}'
						 AND "property"."isArchived" = false
						 AND "property"."deletedDate" IS NULL
 						 AND ("pl"."status" = '${LeaseStatus.ACTIVE}' OR "pl"."status" = '${LeaseStatus.EXPIRING}')
						 AND ("pl"."startDate" <= (CURRENT_DATE - INTERVAL '${pastDays} days') AND "pl"."endDate" >= (CURRENT_DATE - INTERVAL '${pastDays} days')) )
 					GROUP BY "org_uuid"
				`,
			);
			const queryResult = occupiedUnitsQuery.length
				? parseInt(occupiedUnitsQuery[0].total_occupied_units ?? 0, 10)
				: 0;
			return queryResult;
		} catch (err) {
			this.logger.error(err, `Error getting total occupied units in Org`);
			throw err;
		}
	}
	async getTotalUnitsInMaintenance(
		organizationUuid: string,
		pastDays: number = 0,
	): Promise<number> {
		try {
			const maintenanceUnitsQuery = await this.manager.query(
				`SELECT COUNT(DISTINCT "property"."uuid") AS "total_maintenance_units", "property"."organizationUuid" AS "org_uuid"
 					FROM "poo"."property" "property"
 					INNER JOIN "poo"."maintenance" "pm" ON "pm"."propertyUuId"="property"."uuid" AND ("pm"."deletedAt" IS NULL)
 					WHERE (
						 "property"."organizationUuid" = '${organizationUuid}'
						 AND "property"."isArchived" = false
						 AND "property"."deletedDate" IS NULL
 						 AND ("pm"."status" != '${MaintenanceStatus.COMPLETED}')
						 AND ("pm"."startDate" <= (CURRENT_DATE - INTERVAL '${pastDays} days') AND "pm"."endDate" >= (CURRENT_DATE - INTERVAL '${pastDays} days')) )
 					GROUP BY "org_uuid"
				`,
			);
			const queryResult = maintenanceUnitsQuery.length
				? parseInt(maintenanceUnitsQuery[0].total_maintenance_units ?? 0, 10)
				: 0;
			return queryResult;
		} catch (err) {
			this.logger.error(
				err.message,
				`Error getting total units in maintenance in Org`,
			);
			throw err;
		}
	}

	async getPropertyCountDataInOrganization(
		organizationUuid: string,
	): Promise<PropertyCountData> {
		try {
			const propertyCountData = new PropertyCountData();
			const propertyCountDataQuery = await this.manager.query(`
				SELECT P."organizationUuid" AS "org_uuid",
					SUM(CASE WHEN P."parentPropertyUuid" IS NULL and P."isArchived" = false  then 1 else 0 end) as total_properties,
					SUM(CASE WHEN P."isMultiUnit" = true and P."isArchived" = false  then 1 else 0 end) as multi_units_properties,
					SUM(CASE WHEN P."isArchived"  = true then 1 else 0 end) as archived_units,
					SUM(CASE WHEN P."isDraft"  = true then 1 else 0 end) as draft_units
				FROM "poo"."property" P
				WHERE P."organizationUuid" = '${organizationUuid}' AND P."deletedDate" IS NULL
				GROUP BY org_uuid
			`);
			if (propertyCountDataQuery.length) {
				propertyCountData.totalProperties =
					parseInt(propertyCountDataQuery[0].total_properties, 10) || 0;
				propertyCountData.multiUnits =
					parseInt(propertyCountDataQuery[0].multi_units_properties, 10) || 0;
				propertyCountData.archivedProperties =
					parseInt(propertyCountDataQuery[0].archived_units, 10) || 0;
				propertyCountData.draftProperties =
					parseInt(propertyCountDataQuery[0].draft_units, 10) || 0;
				propertyCountData.singleUnits =
					propertyCountData.totalProperties - propertyCountData.multiUnits;
			}

			return propertyCountData;
		} catch (err) {
			this.logger.error(
				err,
				`Error getting property count data in organization`,
			);
			throw err;
		}
	}
	async getTotalOverdueRents(
		organizationUuid: string,
	): Promise<RentOverdueLeaseDto> {
		try {
			const overdueRentsResult = await this.manager.query(
				`
				SELECT 
					COUNT(*) AS overDueLeaseCount,
					SUM(l."rentAmount") AS overDueRentSum
				FROM
					poo.lease l
				JOIN
					poo.property p ON p.uuid = l."propertyUuId" AND p."organizationUuid" = '${organizationUuid}'
				LEFT JOIN
					(
						SELECT
							t."leaseId",
							SUM(t.amount) AS total_paid
						FROM
							poo.transaction t
						WHERE
							t."transactionType" = '${TransactionType.REVENUE}'
							AND t."revenueType" = '${RevenueType.PROPERTY_RENTAL}'
							AND t."transactionDate" <= CURRENT_DATE
						GROUP BY
							t."leaseId"
					) payments ON l.id = payments."leaseId"
				WHERE
					l."endDate" >= CURRENT_DATE
					AND public.calculate_next_due_date(l."startDate", l."paymentFrequency", l."customPaymentFrequency", l."rentDueDay") <= CURRENT_DATE
					AND (payments.total_paid IS NULL OR payments.total_paid < l."rentAmount")
					AND l."isArchived" = false
					AND l."isDraft" = false;
			`,
			);
			const overdueRents: RentOverdueLeaseDto = overdueRentsResult.length
				? {
						overDueLeaseCount:
							parseInt(overdueRentsResult[0].overdueleasecount, 10) || 0,
						overDueRentSum:
							parseFloat(overdueRentsResult[0].overduerentsum) || 0,
					}
				: { overDueLeaseCount: 0, overDueRentSum: 0 };
			return overdueRents;
		} catch (err) {
			this.logger.error(
				err.message,
				err,
				`Error getting total overdue rents in Org`,
			);
			throw err;
		}
	}

	private async getOrganizationUnitsConditions(
		organizationUuid: string,
		queryBuilder: SelectQueryBuilder<Property>,
	) {
		queryBuilder
			.where('property.organizationUuid = :organizationUuid', {
				organizationUuid,
			})
			.andWhere('property.isArchived = false')
			.andWhere('property.isMultiUnit = false');
	}
}
