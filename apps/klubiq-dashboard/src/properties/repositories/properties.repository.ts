import { Injectable, Logger } from '@nestjs/common';
import { Amenity, BaseRepository, PageOptionsDto } from '@app/common';
import { EntityManager } from 'typeorm';
import { Property } from '../entities/property.entity';
import {
	AmenityDto,
	CreatePropertyDto,
	CreatePropertyUnitDto,
} from '../dto/requests/create-property.dto';
import { CreateAddressDto } from '../dto/requests/create-address.dto';

@Injectable()
export class PropertyRepository extends BaseRepository<Property> {
	protected readonly logger = new Logger(PropertyRepository.name);
	constructor(manager: EntityManager) {
		super(Property, manager);
	}

	async createProperty(
		createData: CreatePropertyDto,
		orgUuid: string,
		isDraft: boolean = false,
	) {
		try {
			this.logger.log(`Creating new property for org: ${orgUuid}`);
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
						organizationUuid: orgUuid,
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
						orgUuid,
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
		orgUuid: string,
		manager: EntityManager,
		property: Property,
		address: CreateAddressDto,
	): Promise<Property[]> {
		const units = unitsToCreate.map((unit) => {
			return {
				...unit,
				organization: {
					organizationUuid: orgUuid,
				},
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
		pageDto?: PageOptionsDto,
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
				.andWhere('property.parentProperty IS NULL')
				.andWhere('property.isArchived = :isArchived', {
					isArchived: false,
				})
				.orderBy('property.updatedDate', pageDto.order)
				.skip(pageDto.skip)
				.take(pageDto.take);
			return await queryBuilder.getManyAndCount();
		} catch (err) {
			this.logger.error(err, `Error getting properties for Org: ${orgUuid}`);
			throw err;
		}
	}

	async getAPropertyInAnOrganization(orgUuid: string, propertyUuid: string) {
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
				.where('property.organizationUuid = :organizationUuid', {
					organizationUuid: orgUuid,
				})
				.andWhere('property.uuid = :propertyUuid', {
					propertyUuid: propertyUuid,
				})
				.getOne();
			console.timeEnd('get property');
			return propertyData;
		} catch (err) {
			this.logger.error(err, `Error getting a property for Org: ${orgUuid}`);
			throw err;
		}
	}
	async saveDraftProperty(propertyUuid: string, orgUuid: string) {
		try {
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.update(Property)
				.set({ isDraft: false })
				.where('uuid = :propertyUuid', { propertyUuid })
				.orWhere('parentPropertyUuid = :propertyUuid', { propertyUuid })
				.andWhere('organizationUuid = :orgUuid', { orgUuid })
				.execute();
		} catch (err) {
			this.logger.error(
				err,
				`Error saving a draft property for Org: ${orgUuid}`,
			);
			throw err;
		}
	}

	async archiveProperty(propertyUuid: string, orgUuid: string) {
		try {
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.update(Property)
				.set({ isArchived: true, archivedDate: new Date() })
				.where('uuid = :propertyUuid', { propertyUuid })
				.orWhere('parentPropertyUuid = :propertyUuid', { propertyUuid })
				.andWhere('organizationUuid = :orgUuid', { orgUuid })
				.execute();
		} catch (err) {
			this.logger.error(err, `Error archiving a property for Org: ${orgUuid}`);
			throw err;
		}
	}

	async deleteProperty(propertyUuid: string, orgUuid: string) {
		try {
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.softDelete()
				.where('uuid = :propertyUuid', { propertyUuid })
				.orWhere('parentPropertyUuid = :propertyUuid', { propertyUuid })
				.andWhere('organizationUuid = :orgUuid', { orgUuid })
				.execute();
		} catch (err) {
			this.logger.error(err, `Error deleting a property from Org: ${orgUuid}`);
			throw err;
		}
	}
}
