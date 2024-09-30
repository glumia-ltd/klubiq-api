import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { PropertyType } from '../database/entities/property-type.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class PropertyTypeRepository extends BaseRepository<PropertyType> {
	protected readonly logger = new Logger(PropertyTypeRepository.name);
	constructor(manager: EntityManager) {
		super(PropertyType, manager);
	}
}
