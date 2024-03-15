import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UsersRepository } from './users.repository';
// import { UserProfile, UserProfilesRepository } from '@app/common';
import { AuthService } from '@app/auth';
import { CreateOrganizationUserDto } from './dto/create-organization-user.dto';
import { OrganizationRepository } from '../organization/organization.repository';
import { OrganizationUser } from './entities/organization-user.entity';
import { Organization } from '../organization/entities/organization.entity';
import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import { UserProfilesRepository } from '@app/common/repositories/user-profiles.repository';

@Injectable()
export class UsersService {
	private readonly usersRepository: UsersRepository;
	private readonly userProfilesRepository: UserProfilesRepository;
	private readonly organizationRepository: OrganizationRepository;
	private readonly logger = new Logger(UsersService.name);
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		private readonly authService: AuthService,
	) {
		this.usersRepository = new UsersRepository(entityManager);
		this.userProfilesRepository = new UserProfilesRepository(entityManager);
		this.organizationRepository = new OrganizationRepository(entityManager);
	}

	async create(
		createUserDto: CreateOrganizationUserDto,
	): Promise<UserProfile | undefined> {
		const displayName = `${createUserDto.firstName} ${createUserDto.lastName}`;
		try {
			const fireUser = await this.authService.createUser({
				email: createUserDto.email,
				password: createUserDto.password,
				displayName: displayName,
			});
			this.logger.debug('Firebase user created:', fireUser);

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
			this.logger.error('Error creating user:', error);
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
}
