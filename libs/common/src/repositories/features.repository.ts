import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Feature } from '../database/entities/feature.entity';

@Injectable()
export class FeaturesRepository extends BaseRepository<Feature> {
	protected readonly logger = new Logger(FeaturesRepository.name);
	constructor(manager: EntityManager) {
		super(Feature, manager);
	}
}
