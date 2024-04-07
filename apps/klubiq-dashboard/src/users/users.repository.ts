import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class UsersRepository extends BaseRepository<OrganizationUser> {
	protected readonly logger = new Logger(UsersRepository.name);
	constructor(manager: EntityManager) {
		super(OrganizationUser, manager);
	}

	async getUserByEmailOrFirebaseId(
		identifier: string,
	): Promise<OrganizationUser | null> {
		try {
			// Try to find a user by email
			let user = await this.findOne({
				relations: ['profile'], // Eager load the profile relationship
				where: {
					profile: {
						email: identifier,
					},
				},
			});

			// If no user is found by email, try to find by firebaseId
			if (!user) {
				user = await this.findOne({
					where: {
						firebaseId: identifier,
					},
				});
			}

			return user || null;
		} catch (error) {
			console.error('Error fetching user:', error);
			return null;
		}
	}
}
