import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UserProfile, UserProfilesRepository } from '@app/common';
import { AuthService } from '@app/auth';
import { CreateOrganizationUserDto } from './dto/create-organization-user.dto';
import { OrganizationRepository } from '../organization/organization.repository';
// import { UpdateOrganizationUserDto } from './dto/update-organization-user.dto';
import { OrganizationUser } from './entities/organization-user.entity';
import { Organization } from '../organization/entities/organization.entity';

@Injectable()
export class UsersService {
	private readonly usersRepository: UsersRepository;
	private readonly userProfilesRepository: UserProfilesRepository;
	private readonly OrganizationRepository: OrganizationRepository;
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		private readonly authService: AuthService,
	) {
		this.usersRepository = new UsersRepository(entityManager);
		this.userProfilesRepository = new UserProfilesRepository(entityManager);
		this.OrganizationRepository = new OrganizationRepository(entityManager);
	}

	async create(
		createUserDto: CreateOrganizationUserDto,
	): Promise<UserProfile | undefined> {
		try {
			const fireUser = await this.authService.createUser({
				email: createUserDto.email,
				password: createUserDto.password,
				displayName: createUserDto.firstName + ' ' + createUserDto.lastName,
			});

			if (fireUser) {
				const transaction =
					await this.userProfilesRepository.manager.transaction(
						async (entityManager) => {
							const user: OrganizationUser = {
								firstName: createUserDto.firstName,
								lastName: createUserDto.lastName,
								firebaseId: fireUser.uid,
								organization: {
									name: createUserDto.companyName,
								},
							};

							const userProfile: UserProfile = {
								email: createUserDto.email,
								firebaseId: fireUser.uid,
								organizationUser: user,
							};

							await entityManager.save(user);
							const savedUserProfile = await entityManager.save(userProfile);
							return savedUserProfile;
						},
					);

				if (transaction) {
					await this.authService.sendVerificationEmail(createUserDto.email);
					return transaction;
				}
				return undefined;
			}
		} catch (error) {
			console.error('Error creating user:', error);
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

	findOne(id: number) {
		return `This action returns a #${id} user`;
	}

	// update(id: number, updateOrgUserDto: UpdateOrganizationUserDto) {
	// 	return `This action updates a #${id} user`;
	// }

	remove(id: number) {
		return `This action removes a #${id} user`;
	}

	private async preloadOrganization(name: string): Promise<Organization> {
		const org = await this.OrganizationRepository.findOneByCondition({
			name: name,
		});
		if (org) {
			return org;
		}
		return { name } as Organization;
	}
}
