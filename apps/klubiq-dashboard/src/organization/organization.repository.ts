import { Organization } from './entities/organization.entity';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

	async softDeleteEntity(uuid: string): Promise<boolean> {
		try {
			const data = await this.softDelete({ organizationUuid: uuid });
			return data.affected > 0 ? true : false;
		} catch (err) {
			this.logger.error('Error deleting organization', err);
			throw new Error(`Error deleting organization. Error: ${err}`);
		}
	}

	async deactivateOrganization(uuid: string): Promise<Organization> {
		try {
			const org = await this.findOne({ where: { organizationUuid: uuid } });
			if (!org) {
				throw new NotFoundException('Organization not found');
			}
			if (org.isActive) {
				org.isActive = false;
				return await this.save(org);
			}
		} catch (err) {
			this.logger.error('Error deleting organization', err);
			throw new Error(`Error deleting organization. Error: ${err}`);
		}
	}
}
