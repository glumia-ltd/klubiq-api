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

	async getUserByFirebaseIdOrEmail(query: string) {
		const data = await this.repository.findOne({
			relations: { profile: true },
			where: [{ firebaseId: query }, { profile: { email: query } }],
			select: {
				organizationUserId: true,
				organizationUserUuid: true,
				firebaseId: true,
			},
		});
		if (!data) {
			throw new Error('User not found');
		}
		return data;
	}
}
