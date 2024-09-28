import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { FeaturePermission } from '../database/entities/feature-permission.entity';

@Injectable()
export class FeaturesPermissionRepository extends BaseRepository<FeaturePermission> {
	protected readonly logger = new Logger(FeaturesPermissionRepository.name);
	constructor(manager: EntityManager) {
		super(FeaturePermission, manager);
	}
}
