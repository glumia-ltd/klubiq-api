import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UsersRepository } from '../repositories/users.repository';
import {
	UserProfilesRepository,
	RolesRepository,
	UserProfile,
} from '@app/common';
import { OrganizationUser } from '../entities/organization-user.entity';
import { UpdateUserDto } from '../dto/update-organization-user.dto';
import { AuthUserResponseDto } from '@app/auth';
import { UserResponseDto } from '../dto/create-organization-user.dto';

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		private readonly usersRepository: UsersRepository,
		private readonly userProfilesRepository: UserProfilesRepository,
		private readonly rolesRepository: RolesRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
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

	async getUserByEmailOrFirebaseId(
		identifier: string,
	): Promise<UserResponseDto | null> {
		try {
			const user =
				await this.usersRepository.getUserByFirebaseIdOrEmail(identifier);

			return this.mapper.map(user, OrganizationUser, UserResponseDto);
		} catch (error) {
			console.error('Error fetching user:', error);
			return null;
		}
	}

	findAll() {
		return `This action returns all users`;
	}

	async updateUserProfileAndOrganizationUser(
		profileUuid: string,
		updateUserDto: UpdateUserDto,
	): Promise<UserResponseDto | null> {
		const organizationUser = await this.usersRepository.findOne({
			where: { profile: { profileUuid: profileUuid } },
			relations: ['profile'],
		});

		if (organizationUser) {
			if (updateUserDto.profile) {
				Object.assign(organizationUser.profile, updateUserDto.profile);
			}

			if (updateUserDto.organizationUser) {
				Object.assign(organizationUser, updateUserDto.organizationUser);
			}

			await this.usersRepository.save(organizationUser);
			return this.mapper.map(
				organizationUser,
				OrganizationUser,
				UserResponseDto,
			);
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

	async getLoggedInLandlordUser(email: string): Promise<AuthUserResponseDto> {
		try {
			const user =
				await this.userProfilesRepository.getLandLordUserLoginInfoByFirebaseId(
					email,
				);
			return this.mapper.map(user, UserProfile, AuthUserResponseDto);
		} catch (err) {
			throw err;
		}
	}
}
