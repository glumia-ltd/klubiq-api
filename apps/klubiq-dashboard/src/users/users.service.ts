import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
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
	private readonly logger = new Logger(UsersService.name);
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@Inject(forwardRef(() => AuthService))
		private readonly authService: AuthService,
		private readonly usersRepository: UsersRepository,
		private readonly organizationRepository: OrganizationRepository,
		private readonly userProfilesRepository: UserProfilesRepository,
		private readonly rolesRepository: RolesRepository,
	) {}

	async create(
		createUserDto: CreateOrganizationUserDto,
	): Promise<UserProfile | undefined> {
		const displayName = `${createUserDto.firstName} ${createUserDto.lastName}`;
		try {
			// GET  ROLE
			//TODO GET ROLE AND SET ROLE FOR USER
			// const systemRoles = await Promise.all(
			// 	createUserDto.roles.map(async (name) => this.preloadSystemRole(name)),
			// );

			const fireUser = await this.authService.createUser({
				email: createUserDto.email,
				password: createUserDto.password,
				displayName: displayName,
			});

			if (fireUser) {
				const userProfile = await this.createUserWithOrganization(
					fireUser,
					createUserDto,
				);
				await this.authService.sendVerificationEmail(
					createUserDto.email,
					displayName,
				);
				return userProfile;
			}

			return undefined;
		} catch (error) {
			throw error;
		}
	}

	private async createUserWithOrganization(
		fireUser: any,
		createUserDto: CreateOrganizationUserDto,
	): Promise<UserProfile> {
		const entityManager = this.organizationRepository.manager;

		return entityManager.transaction(async (transactionalEntityManager) => {
			const organization = await this.findOrCreateOrganization(
				createUserDto.companyName, // Assuming this is the correct property name
				transactionalEntityManager,
			);
			console.log('organization', organization);
			const user = new OrganizationUser();
			user.firstName = createUserDto.firstName;
			user.lastName = createUserDto.lastName;
			user.firebaseId = fireUser.uid;
			user.organization = organization;

			const userProfile = new UserProfile();
			userProfile.email = createUserDto.email;
			userProfile.firebaseId = fireUser.uid;
			userProfile.organizationUser = user;

			await transactionalEntityManager.save(user);
			await transactionalEntityManager.save(userProfile);

			this.logger.debug('User and profile created:', userProfile);
			return userProfile;
		});
	}

	private async findOrCreateOrganization(
		name: string,
		entityManager: EntityManager,
	): Promise<Organization> {
		const existingOrganization = await entityManager.findOne(Organization, {
			where: { name: name },
		});

		if (existingOrganization) {
			return existingOrganization;
		}

		const newOrganization = new Organization();
		newOrganization.name = name;
		return entityManager.save(newOrganization);
	}

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
