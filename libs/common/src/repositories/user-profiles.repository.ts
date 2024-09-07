import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository, UserInvitation } from '@app/common';
import { UserProfile } from '../database/entities/user-profile.entity';
import { EntityManager } from 'typeorm';
import { DateTime } from 'luxon';
import { OrganizationUser } from 'apps/klubiq-dashboard/src/users/entities/organization-user.entity';

@Injectable()
export class UserProfilesRepository extends BaseRepository<UserProfile> {
	protected readonly logger = new Logger(UserProfilesRepository.name);
	private readonly timestamp = DateTime.utc().toSQL({ includeOffset: false });
	constructor(manager: EntityManager) {
		super(UserProfile, manager);
	}

	async getUserLoginInfo(id: string): Promise<UserProfile> {
		const data = await this.repository.findOne({
			where: { firebaseId: id },
		});
		if (!data) {
			this.logger.warn('No data found by condition ', id);
			throw new NotFoundException('No data found');
		}
		return data;
	}

	async getLandLordUserInfo(uid: string) {
		console.time('getLandLordUserInfo');
		const userData = await this.manager
			.createQueryBuilder(OrganizationUser, 'user')
			.leftJoin('user.profile', 'profile')
			.leftJoin('user.organization', 'organization')
			.leftJoin('profile.preferences', 'preferences')
			.select([
				'user.organizationUserUuid AS uuid',
				'user.firebaseId AS firebase_id',
				'user.organizationUserId AS id',
				'user.firstName AS first_name',
				'user.lastName AS last_name',
				'user.isAccountVerified AS is_account_verified',
				'profile.firstName AS profile_first_name',
				'profile.lastName AS profile_last_name',
				'profile.email AS email',
				'profile.phoneNumber AS phone',
				'profile.profilePicUrl AS profile_pic_url',
				'profile.isPrivacyPolicyAgreed AS is_privacy_policy_agreed',
				'profile.isTermsAndConditionAccepted AS is_terms_and_condition_accepted',
				'organization.organizationUuid AS org_uuid',
				'organization.organizationId AS org_id',
				'organization.name AS organization',
				'preferences.preferences AS user_preferences',
			])
			.where('user.firebaseId = :uid', { uid })
			.andWhere('user.isActive = :isActive', { isActive: true })
			.getRawOne();
		return userData;
	}

	async checkUerExist(email: string): Promise<boolean> {
		return await this.repository.exists({
			where: { email: email },
		});
	}

	async getLandLordUserLoginInfoByFirebaseId(
		email: string,
	): Promise<UserProfile> {
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
			this.logger.warn(`Landlord User - Email: ${email} not found`);
			throw new NotFoundException('Landlord User not found');
		}
		return data;
	}

	async acceptInvitation(userFirebaseId: string) {
		await this.manager.update(
			UserInvitation,
			{ firebaseUid: userFirebaseId },
			{ acceptedAt: this.timestamp },
		);
	}
}
