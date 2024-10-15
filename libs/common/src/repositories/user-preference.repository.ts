import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { UserPreferences } from '../database/entities/user-preferences.entity';

@Injectable()
export class UserPreferenceRepository extends BaseRepository<UserPreferences> {
	protected readonly logger = new Logger(UserPreferenceRepository.name);
	constructor(manager: EntityManager) {
		super(UserPreferences, manager);
	}
}
