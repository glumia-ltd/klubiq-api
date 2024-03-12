import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UserProfile, UserProfilesRepository } from '@app/common';
import { AuthService } from '@app/auth';
import { CreateOrganizationUserDto } from './dto/create-organization-user.dto';
// import { UpdateOrganizationUserDto } from './dto/update-organization-user.dto';
import { OrganizationUser } from './entities/organization-user.entity';

@Injectable()
export class UsersService {
		private readonly usersRepository: UsersRepository;
		private readonly userProfilesRepository: UserProfilesRepository;
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		private readonly authService: AuthService,
	) {
		this.usersRepository = new UsersRepository(entityManager);
		this.userProfilesRepository = new UserProfilesRepository(entityManager);
	}

	// async create(createUserDto: CreateUserDto) {
	// 	const user = new User();
	// 	user.firstName = createUserDto.firstName;
	// 	user.lastName = createUserDto.lastName;

	// 	const userProfile: UserProfile = {
	// 		email: createUserDto.email,
	// 		dashboardUser: user
	// 	}
	// 	const data = await this.userProfileRepository.createEntity(userProfile);
	// 	return data;
	// }

	async create(createUserDto: CreateOrganizationUserDto) {
		debugger;
		try {
			// Create Firebase user
			const fireUser = await this.authService.createUser({
				email: createUserDto.email,
				password: createUserDto.password,
				displayName: createUserDto.firstName + ' ' + createUserDto.lastName,
				emailVerified: false,
			});

			if (fireUser) {
				const user = new OrganizationUser();
				user.firstName = createUserDto.firstName;
				user.lastName = createUserDto.lastName;
				user.firebaseId = fireUser.uid;

				/**To do: Fire and forget email service to send verification email to user */

				const userProfile: UserProfile = {
					email: createUserDto.email,
					firebaseId: fireUser.uid,
					organizationUser: user,
				};

				const savedUserProfile =
					await this.userProfilesRepository.createEntity(userProfile);

				return savedUserProfile;
			}
		} catch (error) {
			throw error;
		}
	}

	async getUserByFireBaseId(firebaseId: string) {
		return this.usersRepository.findOneByCondition({ firebaseId: firebaseId });
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
}
