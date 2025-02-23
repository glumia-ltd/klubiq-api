import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { OrganizationUser } from '@app/common/database/entities/organization-user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class UsersRepository extends BaseRepository<OrganizationUser> {
	protected readonly logger = new Logger(UsersRepository.name);
	constructor(manager: EntityManager) {
		super(OrganizationUser, manager);
	}

	async getUserByEmailOrUuid(query: string) {
		const data = await this.repository.findOne({
			relations: { profile: true },
			where: [{ organizationUserUuid: query }, { profile: { email: query } }],
			select: {
				organizationUserUuid: true,
				profile: {
					firstName: true,
					lastName: true,
					email: true,
					firebaseId: true,
					profileUuid: true,
				},
			},
		});
		if (!data) {
			throw new Error('User not found');
		}
		return data;
	}
	async getOrgUsersByRoleId(roleId: number, orgId: string) {
		const query = this.createQueryBuilder('organizationUser')
			.leftJoinAndSelect('organizationUser.profile', 'profile')
			.select([
				'profile.profileUuid',
				'profile.email',
				'profile.firstName',
				'profile.lastName',
			])
			.where('organizationUser.roleId = :roleId', { roleId })
			.andWhere('organizationUser.organizationUuid = :orgId', { orgId });
		return await query.getRawMany();
	}

	async getOrgUsersInRoleIds(roleIds: number[], orgId: string) {
		const query = this.createQueryBuilder('organizationUser')
			.leftJoinAndSelect('organizationUser.profile', 'profile')
			.select([
				'profile.profileUuid',
				'profile.email',
				'profile.firstName',
				'profile.lastName',
			])
			.where('organizationUser.organizationUuid = :orgId', { orgId })
			.andWhere('organizationUser.roleId IN (:...roleIds)', { roleIds });
		return await query.getRawMany();
	}
}
