import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { PropertyStatus } from '../database/entities/property-status.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class PropertyStatusRepository extends BaseRepository<PropertyStatus> {
	protected readonly logger = new Logger(PropertyStatusRepository.name);
	constructor(manager: EntityManager) {
		super(PropertyStatus, manager);
	}
}
