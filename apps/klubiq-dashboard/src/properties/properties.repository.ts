import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Property } from './entities/property.entity';

@Injectable()
export class PropertyRepository extends BaseRepository<Property> {
	protected readonly logger = new Logger(PropertyRepository.name);
	constructor(manager: EntityManager) {
		super(Property, manager);
	}
}
