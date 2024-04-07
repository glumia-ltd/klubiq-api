import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { UserProfile } from '../database/entities/user-profile.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserProfilesRepository extends BaseRepository<UserProfile> {
	protected readonly logger = new Logger(UserProfilesRepository.name);
	constructor(manager: EntityManager) {
		super(UserProfile, manager);
	}

	async getUserLoginInfo(email: string): Promise<UserProfile> {
		const data = await this.repository.findOne({
			where: { email: email },
			select: {
				profileId: true,
				profileUuid: true,
				email: true,
				profilePicUrl: true,
				firebaseId: true,
				isPrivacyPolicyAgreed: true,
				isTermsAndConditionAccepted: true,
			},
		});
		if (!data) {
			this.logger.warn('No data found by condition ', email);
			throw new NotFoundException('No data found');
		}
		return data;
	}

	async checkUerExist(email: string): Promise<boolean> {
		return await this.repository.exists({
			where: { email: email },
		});
	}
}
