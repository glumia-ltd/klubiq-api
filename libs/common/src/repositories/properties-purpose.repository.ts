import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository, PropertyPurpose } from '@app/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class PropertyPurposeRepository extends BaseRepository<PropertyPurpose> {
	protected readonly logger = new Logger(PropertyPurposeRepository.name);
	constructor(manager: EntityManager) {
		super(PropertyPurpose, manager);
	}
}
