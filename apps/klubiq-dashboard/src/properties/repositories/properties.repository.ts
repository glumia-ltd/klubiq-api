import {
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { Amenity } from '@app/common/database/entities/property-amenity.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import {
	DisplayOptions,
	UnitStatus,
	UnitType,
} from '@app/common/config/config.constants';
import { Brackets, EntityManager, In, SelectQueryBuilder } from 'typeorm';
import { Property } from '@app/common/database/entities/property.entity';
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
import { find, indexOf, map } from 'lodash';
import { DateTime } from 'luxon';
import { PropertyCountData } from '../dto/responses/property-count.dto';
import { PropertyManagerDto } from '../dto/requests/property-manager.dto';
import { PropertyCategory } from '@app/common/database/entities/property-category.entity';
import { PropertyPurpose } from '@app/common/database/entities/property-purpose.entity';
import { PropertyType } from '@app/common/database/entities/property-type.entity';
import { PropertyStatus } from '@app/common/database/entities/property-status.entity';
import { PropertyAddress } from '@app/common/database/entities/property-address.entity';
import { Unit } from '@app/common/database/entities/unit.entity';
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
			customAmenities,
			typeId,
			purposeId,
			categoryId,
			statusId,
			address,
			orgUuid,
			...propertyData
		} = createData;
		return await this.manager.transaction(
			async (transactionalEntityManager) => {
				// Find the related entities using transactionalEntityManager
				// const category = await transactionalEntityManager.findOneBy(
				// 	PropertyCategory,
				// 	{ id: categoryId },
				// );
				// const purpose = await transactionalEntityManager.findOneBy(
				// 	PropertyPurpose,
				// 	{ id: purposeId },
				// );
				// const type = await transactionalEntityManager.findOneBy(PropertyType, {
				// 	id: typeId,
				// });
				// const status = await transactionalEntityManager.findOneBy(
				// 	PropertyStatus,
				// 	{ id: statusId },
				// );

				// create new amenities
				if (customAmenities && customAmenities.length > 0) {
					const newAmenities = map(customAmenities, (amenity) => {
						return transactionalEntityManager.create(Amenity, {
							name: amenity,
							isPrivate: true,
						});
					});
					await transactionalEntityManager.save(Amenity, newAmenities);
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
					category: { id: categoryId },
					purpose: { id: purposeId },
					type: { id: typeId },
					status: { id: statusId },
					address: savedAddress,
					organization: { organizationUuid: orgUuid },
					manager: { firebaseId: createData.managerUid },
					isDraft,
				});
				const savedProperty = await transactionalEntityManager.save(property);

				const unitsToCreate = units.map((unit) => {
					const newUnit = transactionalEntityManager.create(Unit, {
						...unit,
						property: savedProperty,
					});
					// if (unit.images && unit.images.length > 0) {
					// 	this.upsertUnitImages(newUnit, unit.images);
					// }
					return transactionalEntityManager.save(newUnit);
				});
				const savedUnits = await Promise.all(unitsToCreate);

				//create property images
				if (images && images.length > 0) {
					const propertyImages = images.map((image) => {
						const newImage = transactionalEntityManager.create(PropertyImage, {
							...image,
							property: savedProperty,
							organization: { organizationUuid: orgUuid },
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
			.skip(getPropertyDto.skip)
			.take(getPropertyDto.take)
			.orderBy(`property.${getPropertyDto.sortBy}`, getPropertyDto.order);
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
		await this.createQueryBuilder('property')
			.update(Property)
			.set({ isArchived: true, archivedDate: new Date() })
			.where('uuid = :propertyUuid', { propertyUuid })
			.andWhere('organizationUuid = :orgUuid', { orgUuid })
			.andWhere(
				new Brackets((qb) => {
					qb.where('property."ownerUid" = :ownerUid', { ownerUid: userId })
						.orWhere('property."managerUid" = :managerUid', {
							managerUid: userId,
						})
						.orWhere(
							'property."ownerUid" IS NULL AND property."managerUid" IS NULL',
						);
				}),
			)
			.execute();
	}

	async deleteProperty(propertyUuid: string, orgUuid: string, userId: string) {
		await this.createQueryBuilder('property')
			.softDelete()
			.where('uuid = :propertyUuid', { propertyUuid })
			.andWhere('organizationUuid = :orgUuid', { orgUuid })
			.andWhere(
				new Brackets((qb) => {
					qb.where('property."ownerUid" = :ownerUid', { ownerUid: userId })
						.orWhere('property."managerUid" = :managerUid', {
							managerUid: userId,
						})
						.orWhere(
							'property."ownerUid" IS NULL AND property."managerUid" IS NULL',
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
			typeId,
			categoryId,
			purposeId,
			statusId,
			address,
			customAmenities,
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
				// create new amenities
				if (customAmenities && customAmenities.length > 0) {
					const newAmenities = map(customAmenities, (amenity) => {
						return transactionalEntityManager.create(Amenity, {
							name: amenity,
							isPrivate: true,
						});
					});
					await transactionalEntityManager.save(Amenity, newAmenities);
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
				WHERE (P."organizationUuid" = $1)
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
			SELECT COUNT(u.id) AS total_occupied_units
			FROM poo.unit u
			INNER JOIN poo.lease l ON u.id = l."unitId" AND l."organizationUuid" = $1
			WHERE u.status = '${UnitStatus.OCCUPIED}'
			AND (l."startDate" <= (CURRENT_DATE - INTERVAL ${interval}) AND l."endDate" >= (CURRENT_DATE - INTERVAL ${interval}));`;
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
			(!isOrgOwner &&
				(!unit.property.owner || unit.property.owner.firebaseId !== userId)) ||
			!unit.property.manager ||
			unit.property.manager.firebaseId !== userId
		) {
			throw new Error('You are not authorized to update this property');
		}
		await this.manager.remove(Unit, unit);
	}

	async deleteUnits(
		ids: number[],
		orgUuid: string,
		propertyUuid: string,
		userId: string,
		isOrgOwner: boolean,
	) {
		const property = await this.manager.findOne(Property, {
			where: { uuid: propertyUuid },
		});
		if (!property || property.organization.organizationUuid !== orgUuid) {
			throw new Error('You are not authorized to update this property');
		}
		if (
			(!isOrgOwner &&
				(!property.owner || property.owner.firebaseId !== userId)) ||
			!property.manager ||
			property.manager.firebaseId !== userId
		) {
			throw new Error('You are not authorized to update this property');
		}
		const unitsToRemove = await this.manager.findBy(Unit, { id: In(ids) });
		await this.manager.remove(unitsToRemove);
	}

	async getPropertyGroupedUnitsByOrganization(orgUuid: string) {
		const query = await this.createQueryBuilder('property')
			.leftJoinAndSelect('property.units', 'units')
			.select([
				'property.uuid',
				'property.name',
				'units.id',
				'units.unitNumber',
			])
			.where('property.organizationUuid = :orgUuid', { orgUuid })
			.getMany();
		return query;
	}
}
