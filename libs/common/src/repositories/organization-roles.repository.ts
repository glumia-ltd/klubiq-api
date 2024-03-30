import { OrganizationRole } from '../database/entities/organization-role.entity';
import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class OrganizationRolesRepository extends BaseRepository<OrganizationRole> {
	protected readonly logger = new Logger(OrganizationRolesRepository.name);
	constructor(manager: EntityManager) {
		super(OrganizationRole, manager);
	}
}
