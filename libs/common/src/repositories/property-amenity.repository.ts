import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository, Amenity } from '@app/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class PropertyAmenityRepository extends BaseRepository<Amenity> {
	protected readonly logger = new Logger(PropertyAmenityRepository.name);
	constructor(manager: EntityManager) {
		super(Amenity, manager);
	}
}
