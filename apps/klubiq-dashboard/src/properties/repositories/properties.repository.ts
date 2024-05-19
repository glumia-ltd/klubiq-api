import { Injectable, Logger } from '@nestjs/common';
import {
	Amenity,
	BaseRepository,
	PageDto,
	PageMetaDto,
	PageOptionsDto,
} from '@app/common';
import { EntityManager } from 'typeorm';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dto/requests/create-property.dto';

@Injectable()
export class PropertyRepository extends BaseRepository<Property> {
	protected readonly logger = new Logger(PropertyRepository.name);
	constructor(manager: EntityManager) {
		super(Property, manager);
	}

	async createProperty(createData: CreatePropertyDto, orgUuid: string) {
		try {
			let property: Property;
			await this.manager.transaction(async (transactionalEntityManager) => {
				property = transactionalEntityManager.create(Property, {
					name: createData.name,
					description: createData.description ?? null,
					isMultiUnit: createData.isMultiUnit,
					isDraft: false,
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
					const amenities: Amenity[] = [];
					createData.amenities.map((data) => {
						if (data.id) {
							amenities.push({
								id: data.id,
								name: data.name,
							});
						} else {
							amenities.push({
								name: data.name,
							});
						}
					});
					property.amenities = amenities;
				}
				await transactionalEntityManager.save(property);
				if (createData.isMultiUnit) {
					const units = createData.units.map((unit) => {
						return {
							...unit,
							organization: {
								organizationUuid: orgUuid,
							},
							isDraft: false,
							parentProperty: {
								uuid: property.uuid,
							},
							status: createData.statusId
								? {
										id: createData.statusId,
									}
								: null,
							address: { ...createData.address, unit: unit.name },
						} as Property;
					});
					await transactionalEntityManager.save(Property, units);
				}
			});
			return property;
		} catch (err) {
			throw err;
		}
	}

	async getOrganizationProperties(orgUuid: string, pageDto?: PageOptionsDto) {
		try {
			console.time('getOrganizationProperties');
			const queryBuilder = this.createQueryBuilder('property');
			queryBuilder
				.leftJoinAndSelect('property.purpose', 'pp')
				.addSelect(['pp.displayText as purpose', 'pp.id as id'])
				.leftJoinAndSelect('property.status', 'ps')
				.addSelect(['ps.displayText as status, ps.id as id'])
				.leftJoinAndSelect('property.type', 'pt')
				.addSelect(['pt.displayText as type', 'pt.id as id'])
				.leftJoinAndSelect('property.category', 'pc')
				.addSelect(['pc.displayText as category', 'pc.id as id'])
				.leftJoinAndSelect('property.images', 'pi')
				.addSelect(['pi.url as url'])
				.leftJoinAndSelect('property.address', 'pa')
				.addSelect([
					'pa.id as id',
					'pa.addressLine1 as addressLine1',
					'pa.latitude as latitude',
					'pa.longitude as longitude',
					'pa.city as city',
					'pa.state as state',
					'pa.postalCode as postalCode',
					'pa.isManualAddress as isManualAddress',
					'pa.addressLine2 as addressLine2',
					'pa.unit as unit',
					'pa.country as country',
				])
				.leftJoinAndSelect('property.amenities', 'pf')
				.addSelect(['pf.id as id', 'pf.name as name'])
				.leftJoinAndSelect('property.units', 'punts')
				.leftJoinAndSelect('punts.status', 'puntstatus')
				.addSelect(['puntstatus.displayText as status', 'puntstatus.id as id'])
				.where('property.organizationUuid = :organizationUuid', {
					organizationUuid: orgUuid,
				})
				.andWhere('property.parentProperty IS NULL')
				.orderBy('property.updatedDate', pageDto.order)
				.skip(pageDto.skip)
				.take(pageDto.take);
			const itemCount = await queryBuilder.getCount();
			const { entities } = await queryBuilder.getRawAndEntities();
			const pageMetaDto = new PageMetaDto({
				itemCount,
				pageOptionsDto: pageDto,
			});
			console.timeEnd('getOrganizationProperties');
			return new PageDto(entities, pageMetaDto);
		} catch (err) {
			throw err;
		}
	}
}
