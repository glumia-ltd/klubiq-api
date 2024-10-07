import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { OrganizationSettings } from '../database/entities/organization-settings.entity';

@Injectable()
export class OrganizationSettingsRepository extends BaseRepository<OrganizationSettings> {
	protected readonly logger = new Logger(OrganizationSettingsRepository.name);
	constructor(manager: EntityManager) {
		super(OrganizationSettings, manager);
	}
}
