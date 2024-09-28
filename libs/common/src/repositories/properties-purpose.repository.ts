import { Injectable, Logger } from '@nestjs/common';
import { PropertyPurpose } from '../database/entities/property-purpose.entity';
import { BaseRepository } from './base.repository';
import { EntityManager } from 'typeorm';

@Injectable()
export class PropertyPurposeRepository extends BaseRepository<PropertyPurpose> {
	protected readonly logger = new Logger(PropertyPurposeRepository.name);
	constructor(manager: EntityManager) {
		super(PropertyPurpose, manager);
	}
}
