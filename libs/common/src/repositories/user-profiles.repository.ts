import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { UserInvitation } from '@app/common/database/entities/user-invitation.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { EntityManager } from 'typeorm';
import { DateTime } from 'luxon';
import { OrganizationUser } from '@app/common/database/entities/organization-user.entity';
import { TenantUser } from '../database/entities/tenant.entity';

@Injectable()
export class UserProfilesRepository extends BaseRepository<UserProfile> {
	protected readonly logger = new Logger(UserProfilesRepository.name);
	private readonly timestamp = DateTime.utc().toSQL({ includeOffset: false });
	constructor(manager: EntityManager) {
		super(UserProfile, manager);
	}

	async getUserLoginInfo(
		uuid: string,
		firebase_id: string,
	): Promise<UserProfile> {
		const data = await this.repository.findOne({
			where: { profileUuid: uuid, firebaseId: firebase_id },
		});
		if (!data) {
			this.logger.warn('No data found by condition ', uuid);
			throw new NotFoundException('No data found');
		}
		return data;
	}

	async getLandLordUserInfo(uid: string, firebaseId: string) {
		const userData = await this.manager
			.createQueryBuilder(OrganizationUser, 'user')
			.leftJoin('user.profile', 'profile')
			.leftJoin('user.organization', 'organization')
			.leftJoin('profile.preferences', 'preferences')
			.select([
				'user.organizationUserUuid AS uuid',
				'user.isAccountVerified AS is_account_verified',
				'profile.firstName AS profile_first_name',
				'profile.lastName AS profile_last_name',
				'profile.firebaseId AS firebase_id',
				'profile.profileUuid AS profile_uuid',
				'profile.email AS email',
				'profile.phoneNumber AS phone',
				'profile.profilePicUrl AS profile_pic_url',
				'profile.isPrivacyPolicyAgreed AS is_privacy_policy_agreed',
				'profile.isTermsAndConditionAccepted AS is_terms_and_condition_accepted',
				'organization.organizationUuid AS org_uuid',
				'organization.tenantId AS tenant_id',
				'organization.name AS organization',
				'preferences.preferences AS user_preferences',
			])
			.where('profile.profileUuid = :uid', { uid })
			.andWhere('profile.firebaseId = :firebaseId', { firebaseId })
			.andWhere('user.isActive = :isActive', { isActive: true })
			.getRawOne();
		return userData;
	}

	async getLandLordUserInfoByEmailAndFirebaseId(
		email: string,
		firebaseId: string,
	) {
		return await this.manager
			.createQueryBuilder(OrganizationUser, 'user')
			.leftJoin('user.profile', 'profile')
			.leftJoin('user.organization', 'organization')
			.leftJoin('user.orgRole', 'orgRole')
			.leftJoin('profile.preferences', 'preferences')
			.select([
				'user.organizationUserUuid AS uuid',
				'user.isAccountVerified AS is_account_verified',
				'profile.firstName AS profile_first_name',
				'profile.lastName AS profile_last_name',
				'profile.firebaseId AS firebase_id',
				'profile.profileUuid AS profile_uuid',
				'profile.email AS email',
				'profile.phoneNumber AS phone',
				'profile.profilePicUrl AS profile_pic_url',
				'profile.isPrivacyPolicyAgreed AS is_privacy_policy_agreed',
				'profile.isTermsAndConditionAccepted AS is_terms_and_condition_accepted',
				'orgRole.name AS org_role',
				'organization.organizationUuid AS org_uuid',
				'organization.tenantId AS tenant_id',
				'organization.name AS organization',
				'preferences.preferences AS user_preferences',
			])
			.where('profile.email = :email', { email })
			.andWhere('profile.firebaseId = :firebaseId', { firebaseId })
			.andWhere('user.isActive = :isActive', { isActive: true })
			.getRawOne();
	}

	async getTenantUserInfoByEmailAndFirebaseId(
		email: string,
		firebaseId: string,
	) {
		return await this.manager
			.createQueryBuilder(TenantUser, 'user')
			.leftJoin('user.role', 'role')
			.leftJoin('user.profile', 'profile')
			.leftJoin('profile.preferences', 'user_preferences')
			.select([
				'user.id AS uuid',
				'user.isActive AS isActive',
				'user.companyName AS companyName',
				'profile.firstName AS firstName',
				'profile.lastName AS lastName',
				'profile.firebaseId AS firebaseId',
				'profile.profileUuid AS profileUuid',
				'profile.email AS email',
				'profile.phoneNumber AS phone',
				'profile.profilePicUrl AS profilePicUrl',
				'profile.isPrivacyPolicyAgreed AS isPrivacyPolicyAgreed',
				'profile.isTermsAndConditionAccepted AS isTermsAndConditionAccepted',
				'role.name AS role',
				'user_preferences.preferences AS userPreferences',
			])
			.where('profile.email = :email', { email })
			.andWhere('profile.firebaseId = :firebaseId', { firebaseId })
			.andWhere('user.isActive = :isActive', { isActive: true })
			.getRawOne();
	}

	async checkUserExist(email: string): Promise<boolean> {
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
				profileUuid: true,
				email: true,
				firstName: true,
				lastName: true,
				profilePicUrl: true,
				firebaseId: true,
				phoneNumber: true,
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

	async checkTenantUserExist(email: string): Promise<boolean> {
		// first check if the user has a login account
		const count = await this.manager.count(TenantUser, {
			where: { profile: { email } },
		});
		return count > 0;
	}
	async checkOrganizationUserExist(email: string): Promise<boolean> {
		const count = await this.manager.count(OrganizationUser, {
			where: { profile: { email } },
		});
		return count > 0;
	}
}
