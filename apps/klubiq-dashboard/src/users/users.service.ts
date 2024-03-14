import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import {
	UserProfile,
	UserProfilesRepository,
	Role,
	RolesRepository,
} from '@app/common';
import { AuthService } from '@app/auth';
import { CreateOrganizationUserDto } from './dto/create-organization-user.dto';
import { OrganizationRepository } from '../organization/organization.repository';

// import { UpdateOrganizationUserDto } from './dto/update-organization-user.dto';
import { OrganizationUser } from './entities/organization-user.entity';
import { Organization } from '../organization/entities/organization.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		private readonly authService: AuthService,
		private readonly usersRepository: UsersRepository,
		private readonly organizationRepository: OrganizationRepository,
		private readonly userProfilesRepository: UserProfilesRepository,
		private readonly rolesRepository: RolesRepository,
	) {}

	async create(createUserDto: CreateOrganizationUserDto) {
		debugger;
		try {
			// GET ORG AND ROLES
			const org = await this.preloadOrganization(createUserDto.companyName);
			const systemRoles = await Promise.all(
				createUserDto.roles.map(async (name) => this.preloadSystemRole(name)),
			);
			console.log('User Org: ', org);
			console.log('System Roles: ', systemRoles);

			// Create Firebase user
			const fireUser = await this.authService.createUser({
				email: createUserDto.email,
				password: createUserDto.password,
				displayName: createUserDto.firstName + ' ' + createUserDto.lastName,
				emailVerified: false,
			});

			if (fireUser) {
				const user: OrganizationUser = {
					firstName: createUserDto.firstName,
					lastName: createUserDto.lastName,
					firebaseId: fireUser.uid,
					organization: org,
				};

				/**To do: Fire and forget email service to send verification email to user */

				const userProfile: UserProfile = {
					email: createUserDto.email,
					firebaseId: fireUser.uid,
					organizationUser: user,
					roles: systemRoles,
				};

				const savedUserProfile =
					await this.userProfilesRepository.createEntity(userProfile);

				return savedUserProfile;
			}
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	async getUserByFireBaseId(firebaseId: string) {
		return this.usersRepository.findOneByCondition({ firebaseId: firebaseId }, [
			'profile',
			'role',
			'organization',
		]);
	}

	findAll() {
		return `This action returns all users`;
	}

	async findOne(id: number) {
		return await this.usersRepository.findOneByCondition(
			{ organizationUserId: id },
			['profile', 'role', 'organization'],
		);
	}

	// update(id: number, updateOrgUserDto: UpdateOrganizationUserDto) {
	// 	return `This action updates a #${id} user`;
	// }

	remove(id: number) {
		return `This action removes a #${id} user`;
	}

	private async preloadOrganization(name: string): Promise<Organization> {
		const org = await this.organizationRepository.findOrgByName(name);
		return org;
	}
	private async preloadSystemRole(name: string): Promise<Role> {
		const role = await this.rolesRepository.findOneByCondition({ name: name });
		return role;
	}
}
