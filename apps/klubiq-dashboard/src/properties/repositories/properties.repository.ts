import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
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
			console.time('createProperty');
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
					amenities: createData.amenities ?? null,
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
			console.timeEnd('createProperty');
			return property;
		} catch (err) {
			throw err;
		}
	}
}
