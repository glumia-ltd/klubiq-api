import { Injectable, Logger } from '@nestjs/common';
import { Amenity, BaseRepository } from '@app/common';
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

@Injectable()
export class PropertyRepository extends BaseRepository<Property> {
	protected readonly logger = new Logger(PropertyRepository.name);
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
					organization: {
						organizationUuid: createData.orgUuid,
					},
					owner: {
						firebaseId: createData.ownerUid,
					},
					purpose: createData.purposeId
						? {
								id: createData.purposeId,
							}
						: null,
					status: createData.statusId
						? {
								id: createData.statusId,
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
					console.log('Units created: ', propertyUnits);
				}
			});
			return { ...createdProperty, units: [...propertyUnits] } as Property;
		} catch (err) {
			this.logger.error(err, 'Error creating new property');
			throw err;
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
				organization: property.organization,
				owner: property.owner,
				isDraft: property.isDraft,
				parentProperty: property,
				status: property.status,
				address: { ...address, unit: unit.name },
			} as Property;
		});
		return await manager.save(Property, units);
	}

	async getOrganizationProperties(
		orgUuid: string,
		userId: string,
		getPropertyDto?: GetPropertyDto,
	): Promise<[Property[], number]> {
		try {
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.leftJoinAndSelect('property.purpose', 'pp')
				.leftJoinAndSelect('property.status', 'ps')
				.leftJoinAndSelect('property.type', 'pt')
				.leftJoinAndSelect('property.category', 'pc')
				.leftJoinAndSelect('property.images', 'pi')
				.leftJoinAndSelect('property.address', 'pa')
				.leftJoinAndSelect('property.amenities', 'pf')
				.leftJoinAndSelect('property.units', 'punts')
				.leftJoinAndSelect('punts.status', 'unitsStatus')
				.where('property.organizationUuid = :organizationUuid', {
					organizationUuid: orgUuid,
				})
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
				.andWhere('property.parentProperty IS NULL');
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
		propertyUuid: string,
	) {
		try {
			console.time('get property');
			const propertyData = await this.createQueryBuilder('property')
				.leftJoinAndSelect('property.purpose', 'pp')
				.leftJoinAndSelect('property.status', 'ps')
				.leftJoinAndSelect('property.type', 'pt')
				.leftJoinAndSelect('property.category', 'pc')
				.leftJoinAndSelect('property.images', 'pi')
				.leftJoinAndSelect('property.address', 'pa')
				.leftJoinAndSelect('property.amenities', 'pf')
				.leftJoinAndSelect('property.units', 'punts')
				.leftJoinAndSelect('punts.status', 'puntstatus')
				.where('property.uuid = :propertyUuid', {
					propertyUuid: propertyUuid,
				})
				.andWhere('property.organizationUuid = :organizationUuid', {
					organizationUuid: orgUuid,
				})
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
				.getOne();
			console.timeEnd('get property');
			return propertyData;
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
}
