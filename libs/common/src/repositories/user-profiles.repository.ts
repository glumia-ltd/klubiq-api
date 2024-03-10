import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { UserProfile } from '../database/entities/user-profile.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserProfilesRepository extends BaseRepository<UserProfile> {
  protected readonly logger = new Logger(UserProfilesRepository.name);
  constructor(manager: EntityManager) {
    super(UserProfile, manager);
  }
}
