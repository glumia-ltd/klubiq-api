import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UserProfilesRepository, RolesRepository } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';
import {
	UpdateOrganizationUserDto,
	UpdateUserProfileDto,
} from './dto/update-organization-user.dto';

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

	async getUserByProfileId(profileId: string) {
		return this.usersRepository.findOneByCondition({
			organizationUserUuid: profileId,
		});
	}

	async findLandlordByEmailOrFirebaseId(
		identifier: string,
	): Promise<OrganizationUser | null> {
		const user = await this.usersRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.orgRole', 'role')
			.leftJoinAndSelect('user.profile', 'profile')
			.where('user.email = :identifier OR user.firebaseId = :identifier', {
				identifier,
			})
			.andWhere('role.name = :roleName', { roleName: 'Landlord' })
			.getOne();

		return user;
	}

	findAll() {
		return `This action returns all users`;
	}

	async updateUserProfileAndOrganizationUser(
		profileUuid: string,
		updateUserProfileDto: UpdateUserProfileDto,
		updateOrganizationUserDto: UpdateOrganizationUserDto,
	) {
		const organizationUser = await this.usersRepository.findOne({
			where: { profile: { profileUuid: profileUuid } },
			relations: ['profile'],
		});

		if (organizationUser) {
			if (updateUserProfileDto) {
				Object.assign(organizationUser.profile, updateUserProfileDto);
			}

			if (updateOrganizationUserDto) {
				Object.assign(organizationUser, updateOrganizationUserDto);
			}

			await this.usersRepository.save(organizationUser);
			return organizationUser;
		} else {
			throw new NotFoundException('OrganizationUser not found');
		}
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
