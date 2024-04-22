import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository, PropertyCategory } from '@app/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class PropertyCategoryRepository extends BaseRepository<PropertyCategory> {
	protected readonly logger = new Logger(PropertyCategoryRepository.name);
	constructor(manager: EntityManager) {
		super(PropertyCategory, manager);
	}
}
