import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository, PropertyAmenity } from '@app/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class PropertyAmenityRepository extends BaseRepository<PropertyAmenity> {
	protected readonly logger = new Logger(PropertyAmenityRepository.name);
	constructor(manager: EntityManager) {
		super(PropertyAmenity, manager);
	}
}
