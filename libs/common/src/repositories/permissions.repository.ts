import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { Permission } from '../database/entities/permission.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class PermissionsRepository extends BaseRepository<Permission> {
	protected readonly logger = new Logger(PermissionsRepository.name);
	constructor(manager: EntityManager) {
		super(Permission, manager);
	}
}
