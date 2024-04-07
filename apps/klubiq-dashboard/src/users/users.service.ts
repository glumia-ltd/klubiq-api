import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UserProfilesRepository, RolesRepository } from '@app/common';

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		private readonly usersRepository: UsersRepository,
		private readonly userProfilesRepository: UserProfilesRepository,
		private readonly rolesRepository: RolesRepository,
	) {}

	async getUserByFireBaseId(firebaseId: string) {
		return this.usersRepository.findOneByCondition({ firebaseId: firebaseId });
	}

	async findByEmail(email: string) {
		return this.userProfilesRepository.findOneByCondition({ email: email });
	}

	findAll() {
		return `This action returns all users`;
	}

	async findOne(id: number) {
		return await this.usersRepository.findOneByCondition({
			organizationUserId: id,
		});
	}

	remove(id: number) {
		return `This action removes a #${id} user`;
	}
}
