import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Amenity } from '../database/entities/property-amenity.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class PropertyAmenityRepository extends BaseRepository<Amenity> {
	protected readonly logger = new Logger(PropertyAmenityRepository.name);
	constructor(manager: EntityManager) {
		super(Amenity, manager);
	}
}
