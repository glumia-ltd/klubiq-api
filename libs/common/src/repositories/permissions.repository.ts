import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { Permission } from '../../../../apps/klubiq-dashboard/src/users/entities/permission.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class PermissionsRepository extends BaseRepository<Permission> {
	protected readonly logger = new Logger(PermissionsRepository.name);
	constructor(manager: EntityManager) {
		super(Permission, manager);
	}
}
