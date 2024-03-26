import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class UsersRepository extends BaseRepository<OrganizationUser> {
	protected readonly logger = new Logger(UsersRepository.name);
	constructor(manager: EntityManager) {
		super(OrganizationUser, manager);
	}
}
