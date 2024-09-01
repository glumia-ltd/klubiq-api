import {
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { Amenity } from '@app/common/database/entities/property-amenity.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { RentOverdueLeaseDto } from '@app/common/dto/responses/dashboard-metrics.dto';
import {
	DisplayOptions,
	UnitType,
	RevenueType,
	TransactionType,
} from '@app/common/config/config.constants';
import { Brackets, EntityManager, In, SelectQueryBuilder } from 'typeorm';
import { Property } from '../entities/property.entity';
import {
	CreatePropertyDto,
	PropertyImageDto,
} from '../dto/requests/create-property.dto';
import {
	UpdatePropertyDto,
	UpdateUnitDto,
} from '../dto/requests/update-property.dto';
import {
	GetPropertyDto,
	PropertyFilterDto,
} from '../dto/requests/get-property.dto';
import { filter, find, indexOf } from 'lodash';
import { DateTime } from 'luxon';
import { PropertyCountData } from '../dto/responses/property-count.dto';
import { PropertyManagerDto } from '../dto/requests/property-manager.dto';
import { PropertyCategory } from '@app/common/database/entities/property-category.entity';
import { PropertyPurpose } from '@app/common/database/entities/property-purpose.entity';
import { PropertyType } from '@app/common/database/entities/property-type.entity';
import { PropertyStatus } from '@app/common/database/entities/property-status.entity';
import { PropertyAddress } from '../entities/property-address.entity';
import { Unit } from '../entities/unit.entity';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { CreateUnitDto } from '../dto/requests/create-unit.dto';

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
	}
	///
	/// CREATES PROPERTY RECORD
	///
	async createProperty(
		createData: CreatePropertyDto,
		isDraft: boolean = false,
	) {
		const {
			units,
			images,
			amenities,
			typeId,
			purposeId,
			categoryId,
			statusId,
			address,
			...propertyData
		} = createData;
		return await this.manager.transaction(
			async (transactionalEntityManager) => {
				// Find the related entities using transactionalEntityManager
				const category = await transactionalEntityManager.findOneBy(
					PropertyCategory,
					{ id: categoryId },
				);
				const purpose = await transactionalEntityManager.findOneBy(
					PropertyPurpose,
					{ id: purposeId },
				);
				const type = await transactionalEntityManager.findOneBy(PropertyType, {
					id: typeId,
				});
				const status = await transactionalEntityManager.findOneBy(
					PropertyStatus,
					{ id: statusId },
				);
				const amenitiesData = await transactionalEntityManager.findBy(Amenity, {
					id: In(amenities.map((a) => a.id)),
				});

				// create new amenities
				const amenitiesToCreate = filter(amenities, (a) => !a.id);
				if (amenitiesToCreate.length > 0) {
					const createdAmenities = await transactionalEntityManager.save(
						Amenity,
						amenitiesToCreate,
					);
					amenitiesData.push(...createdAmenities);
				}

				// create the property address
				const propertyAddress = transactionalEntityManager.create(
					PropertyAddress,
					address,
				);
				const savedAddress =
					await transactionalEntityManager.save(propertyAddress);

				// create the property
				const property = transactionalEntityManager.create(Property, {
					...propertyData,
					category,
					purpose,
					type,
					status,
					amenities: amenitiesData,
					address: savedAddress,
					isDraft,
				});
				const savedProperty = await transactionalEntityManager.save(property);

				const unitsToCreate = units.map((unit) => {
					const newUnit = transactionalEntityManager.create(Unit, {
						...unit,
						property: savedProperty,
					});
					if (unit.images && unit.images.length > 0) {
						this.upsertUnitImages(newUnit, unit.images);
					}
					return transactionalEntityManager.save(newUnit);
				});
				const savedUnits = await Promise.all(unitsToCreate);

				//create property images
				if (images && images.length > 0) {
					const propertyImages = images.map((image) => {
						const newImage = transactionalEntityManager.create(PropertyImage, {
							...image,
							property: savedProperty,
							unit: image.unitNumber
								? find(savedUnits, { unitNumber: image.unitNumber })
								: null,
						});
						return transactionalEntityManager.save(newImage);
					});
					await Promise.all(propertyImages);
				}
				return savedProperty;
			},
		);
	}

	async addUnitsToAProperty(
		propertyUuid: string,
		unitsData: CreateUnitDto[],
	): Promise<Unit[]> {
		return this.manager.transaction(async (transactionalEntityManager) => {
			const property = await transactionalEntityManager.findOneBy(Property, {
				uuid: propertyUuid,
			});
			const unitsToCreate = unitsData.map((unit) => {
				const newUnit = transactionalEntityManager.create(Unit, {
					...unit,
					property,
				});
				return transactionalEntityManager.save(newUnit);
			});
			const units = await Promise.all(unitsToCreate);
			return units;
		});
	}

	async getOrganizationProperties(
		orgUuid: string,
		userId: string,
		isOrgOwner: boolean,
		getPropertyDto?: GetPropertyDto,
	): Promise<[Property[], number]> {
		const queryBuilder = this.createQueryBuilder('property');
		queryBuilder
			.leftJoinAndSelect('property.purpose', 'pp')
			.leftJoinAndSelect('property.type', 'pt')
			.leftJoinAndMapOne('property.mainUnit', 'property.units', 'pu')
			.leftJoinAndMapOne(
				'property.mainPhoto',
				'property.images',
				'pi',
				'pi.isMain = TRUE',
			)
			.leftJoinAndSelect('property.address', 'pa')
			.where('property.organizationUuid = :organizationUuid', {
				organizationUuid: orgUuid,
			});
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
			.leftJoinAndSelect('property.units', 'units')
			.leftJoinAndSelect('units.images', 'unitImages')
			.leftJoinAndSelect(
				'units.leases',
				'unitLeases',
				'unitLeases.endDate >= NOW()',
			)
			.leftJoinAndSelect('unitLeases.tenants', 'lease_tenants')
			.where('property.uuid = :propertyUuid', {
				propertyUuid: propertyUuid,
			})
			.andWhere('property.organizationUuid = :organizationUuid', {
				organizationUuid: orgUuid,
			});
		const property = await propertyData.getOne();
		if (!property) {
			throw new NotFoundException('Property not found');
		}
		if (
			!isOrgOwner &&
			(property.owner?.firebaseId !== userId ||
				property.manager?.firebaseId !== userId)
		) {
			throw new UnauthorizedException(
				'You are not authorized to view this property',
			);
		}
		return property;
	}
	async saveDraftProperty(
		propertyUuid: string,
		orgUuid: string,
		userId: string,
	) {
		const queryBuilder = this.createQueryBuilder('property');
		queryBuilder
			.update(Property)
			.set({ isDraft: false })
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
	}

	async archiveProperty(propertyUuid: string, orgUuid: string, userId: string) {
		const queryBuilder = this.createQueryBuilder('property');
		queryBuilder
			.update(Property)
			.set({ isArchived: true, archivedDate: new Date() })
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
	}

	async deleteProperty(propertyUuid: string, orgUuid: string, userId: string) {
		const queryBuilder = this.createQueryBuilder('property');
		queryBuilder
			.softDelete()
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
	}

	//UPDATE UNIT AND IT'S IMAGES
	async updateUnit(id: number, data: UpdateUnitDto) {
		await this.manager.update(Unit, id, data);
		const updatedUnit = await this.manager.findOne(Unit, {
			where: { id },
		});
		if (data.images && data.images.length > 0) {
			await this.upsertUnitImages(updatedUnit, data.images);
		}
	}

	// 5. Updating property images
	private async upsertUnitImages(
		unit: Unit,
		images: PropertyImageDto[],
	): Promise<void> {
		// Save new images
		await Promise.all(
			images.map((image) => {
				this.manager.upsert(
					PropertyImage,
					{
						...image,
						unit,
					},
					['id'],
				);
			}),
		);
	}

	// 5. Updating and saving property images
	private async updatePropertyImages(
		property: Property,
		images: PropertyImageDto[],
	): Promise<void> {
		// Clear existing images if necessary
		await this.manager.delete(PropertyImage, { property });

		// Save new images
		await Promise.all(
			images.map((image) => {
				const newImage = this.manager.create(PropertyImage, {
					...image,
					property,
				});
				return this.manager.save(PropertyImage, newImage);
			}),
		);
	}
	async updateProperty(
		propertyUuid: string,
		orgUuid: string,
		userId: string,
		data: UpdatePropertyDto,
		isOrgOwner: boolean,
	) {
		const {
			units,
			images,
			amenities,
			typeId,
			categoryId,
			purposeId,
			statusId,
			address,
			...propertyData
		} = data;
		return await this.manager.transaction(
			async (transactionalEntityManager) => {
				const property = await transactionalEntityManager.findOne(Property, {
					where: { uuid: propertyUuid },
					relations: ['organization'],
				});
				if (!property) {
					throw new Error('Property not found');
				}
				if (property.organization.organizationUuid !== orgUuid) {
					throw new Error('You are not authorized to update this property');
				}
				if (
					!isOrgOwner &&
					(property.owner?.firebaseId !== userId ||
						property.manager?.firebaseId !== userId)
				) {
					throw new Error('You are not authorized to update this property');
				}
				if (typeId) {
					property.type = await transactionalEntityManager.findOneBy(
						PropertyType,
						{ id: typeId },
					);
				}
				if (categoryId) {
					property.category = await transactionalEntityManager.findOneBy(
						PropertyCategory,
						{ id: categoryId },
					);
				}
				if (purposeId) {
					property.purpose = await transactionalEntityManager.findOneBy(
						PropertyPurpose,
						{ id: purposeId },
					);
				}
				if (statusId) {
					property.status = await transactionalEntityManager.findOneBy(
						PropertyStatus,
						{ id: statusId },
					);
				}
				if (address) {
					await transactionalEntityManager.update(
						PropertyAddress,
						property.address.id,
						address,
					);
				}
				if (amenities) {
					const amenityList = await transactionalEntityManager.findBy(Amenity, {
						id: In(amenities.map((a) => a.id)),
					});
					property.amenities = amenityList;
				}
				// create new amenities
				const amenitiesToCreate = filter(amenities, (a) => !a.id);
				if (amenitiesToCreate.length > 0) {
					const createdAmenities = await transactionalEntityManager.save(
						Amenity,
						amenitiesToCreate,
					);
					property.amenities.push(...createdAmenities);
				}
				await transactionalEntityManager.update(
					Property,
					propertyUuid,
					propertyData,
				);
				if (units && units.length > 0) {
					await Promise.all(
						units.map((unit) => this.updateUnit(unit.id, unit)),
					);
				}
				if (images && images.length > 0) {
					await this.updatePropertyImages(property, images);
				}
				return transactionalEntityManager.findOne(Property, {
					where: { uuid: propertyUuid },
					relations: [
						'type',
						'category',
						'purpose',
						'status',
						'address',
						'units',
						'amenities',
						'images',
					],
				});
			},
		);
	}
	async getTotalUnits(orgUuid: string): Promise<number> {
		const query = `SELECT 
					P."organizationUuid" AS org_uuid,
					SUM(P."unitCount") AS total_units
				FROM poo.property P
				WHERE (P."organizationUuid" = $1 AND P."isArchived" = false AND P."deletedDate" IS NULL)
				GROUP BY P."organizationUuid"`;
		const totalUnitsQuery = await this.manager.query(query, [orgUuid]);
		const queryResult = totalUnitsQuery.length
			? parseInt(totalUnitsQuery[0].total_units, 10)
			: 0;
		return queryResult;
	}

	async getTotalOccupiedUnits(
		organizationUuid: string,
		pastDays: number = 0,
	): Promise<number> {
		const interval = `'${pastDays} days'`;
		const query = `
			SELECT COUNT(DISTINCT "unit"."id") AS "total_occupied_units", "property"."organizationUuid" AS "org_uuid"
			FROM "poo"."unit" "unit"
			INNER JOIN "poo"."property" "property" ON "unit"."propertyUuid" = "property"."uuid"
			WHERE "property"."organizationUuid" = $1
			  AND "property"."isArchived" = false
			  AND "property"."deletedDate" IS NULL
			  AND EXISTS (
			    SELECT 1
			    FROM "poo"."lease" "lease"
			    WHERE "lease"."unitId" = "unit"."id"
			      AND "lease"."deletedAt" IS NULL
			      AND ("lease"."startDate" <= (CURRENT_DATE - INTERVAL ${interval}) AND "lease"."endDate" >= (CURRENT_DATE - INTERVAL ${interval}))
			  )
			GROUP BY "org_uuid";`;
		const occupiedUnitsQuery = await this.manager.query(query, [
			organizationUuid,
		]);
		const queryResult = occupiedUnitsQuery.length
			? parseInt(occupiedUnitsQuery[0].total_occupied_units ?? 0, 10)
			: 0;
		return queryResult;
	}
	async getTotalUnitsInMaintenance(
		organizationUuid: string,
		pastDays: number = 0,
	): Promise<number> {
		if (pastDays > 0) {
			return 0 * pastDays;
		}
		return 0;
	}

	async getPropertyCountDataInOrganization(
		organizationUuid: string,
	): Promise<PropertyCountData> {
		const propertyCountData = new PropertyCountData();
		const propertyCountDataQuery = await this.manager.query(
			`
				SELECT P."organizationUuid" AS "org_uuid",
					COUNT(P."uuid") as total_properties,
					SUM(P."unitCount") as total_units,
					SUM(CASE WHEN P."isMultiUnit" = true then 1 else 0 end) as multi_units_properties,
					SUM(CASE WHEN P."isArchived" = true then 1 else 0 end) as archived_units,
					SUM(CASE WHEN P."isDraft" = true then 1 else 0 end) as draft_units
				FROM "poo"."property" P
				WHERE P."organizationUuid" = $1 AND P."deletedDate" IS NULL
				GROUP BY org_uuid
			`,
			[organizationUuid],
		);
		if (propertyCountDataQuery.length) {
			propertyCountData.totalUnits =
				parseInt(propertyCountDataQuery[0].total_units, 10) || 0;
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
	}
	async getTotalOverdueRents(
		organizationUuid: string,
	): Promise<RentOverdueLeaseDto> {
		const query = `
			SELECT
			    COUNT(*) AS overDueLeaseCount,
			    SUM(l."rentAmount") AS overDueRentSum
			FROM
			    poo.lease l
			JOIN
			    poo.unit u ON u.id = l."unitId"
			JOIN
			    poo.property p ON p.uuid = u."propertyUuid" AND p."organizationUuid" = $1
			LEFT JOIN
			    (
			        SELECT
			            t."leaseId",
			            SUM(t.amount) AS total_paid
			        FROM
			            poo.transaction t
			        WHERE
			            t."transactionType" = $2
			            AND t."revenueType" = $3
			            AND t."transactionDate" <= CURRENT_DATE
			        GROUP BY
			            t."leaseId"
			    ) payments ON l.id = payments."leaseId"
			WHERE
			    l."endDate" >= CURRENT_DATE
			    AND public.calculate_next_due_date(l."startDate", l."paymentFrequency", l."customPaymentFrequency", l."rentDueDay") <= CURRENT_DATE
			    AND (payments.total_paid IS NULL OR payments.total_paid < l."rentAmount")
			    AND l."isArchived" = false
			    AND l."isDraft" = false;`;
		const overdueRentsResult = await this.manager.query(query, [
			organizationUuid,
			TransactionType.REVENUE,
			RevenueType.PROPERTY_RENTAL,
		]);
		const overdueRents: RentOverdueLeaseDto = overdueRentsResult.length
			? {
					overDueLeaseCount:
						parseInt(overdueRentsResult[0].overdueleasecount, 10) || 0,
					overDueRentSum: parseFloat(overdueRentsResult[0].overduerentsum) || 0,
				}
			: { overDueLeaseCount: 0, overDueRentSum: 0 };
		return overdueRents;
	}

	// 7. Delete a unit and its associated images
	async deleteUnit(
		id: number,
		orgUuid: string,
		userId: string,
		isOrgOwner: boolean,
	): Promise<void> {
		const unit = await this.manager.findOne(Unit, {
			where: { id },
			relations: ['images', 'property'],
		});
		if (!unit) {
			throw new Error('Unit not found');
		}
		if (unit.property.organization.organizationUuid !== orgUuid) {
			throw new Error('You are not authorized to update this property');
		}
		if (
			!isOrgOwner &&
			(!unit.property.owner || unit.property.owner.firebaseId !== userId) &&
			(!unit.property.manager || unit.property.manager.firebaseId !== userId)
		) {
			throw new Error('You are not authorized to update this property');
		}
		await this.manager.remove(Unit, unit);
	}
}
