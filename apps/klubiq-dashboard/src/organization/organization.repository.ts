import { Organization } from './entities/organization.entity';
import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class OrganizationRepository extends BaseRepository<Organization> {
	protected readonly logger = new Logger(OrganizationRepository.name);
	constructor(manager: EntityManager) {
		super(Organization, manager);
	}

	async findOneOrCreateByName(name: string, relations: string[] = []) {
		try {
			const existingEntity = await this.repository.findOne({
				where: { name: name },
				relations,
			});

			if (!existingEntity) {
				const newEntity = {
					name: name,
				};

				const createdEntity = this.repository.create(newEntity);
				const savedEntity = await this.repository.save(createdEntity);
				return savedEntity;
			}

			return existingEntity;
		} catch (error) {
			console.error('Error finding or creating entity:', error);
			throw error;
		}
	}

	async findOrgByName(name: string): Promise<Organization> {
		let organization = await this.findOneBy({ name: name });
		if (!organization) {
			organization = await this.createEntity({ name: name });
		}
		return organization;
	}
}
