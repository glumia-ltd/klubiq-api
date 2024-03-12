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
}
