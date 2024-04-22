import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository, PropertyStatus } from '@app/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class PropertyStatusRepository extends BaseRepository<PropertyStatus> {
	protected readonly logger = new Logger(PropertyStatusRepository.name);
	constructor(manager: EntityManager) {
		super(PropertyStatus, manager);
	}
}
