import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UserProfile, UserProfilesRepository } from '@app/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { AuthService } from '@app/auth';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		private readonly usersRepository: UsersRepository,
		private readonly userProfilesRepository: UserProfilesRepository,
		private readonly authService: AuthService,
	) {}

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

	async create(createUserDto: CreateUserDto) {
		try {
			// Create Firebase user
			const fireUser = await this.authService.createUser({
				email: createUserDto.email,
				password: createUserDto.password,
				displayName: createUserDto.firstName + ' ' + createUserDto.lastName,
				emailVerified: false,
			});

			if (fireUser) {
				const user = new User();
				user.firstName = createUserDto.firstName;
				user.lastName = createUserDto.lastName;
				user.firebaseId = fireUser.uid;

				/**To do: Fire and forget email service to send verification email to user */

				const userProfile: UserProfile = {
					email: createUserDto.email,
					firebaseId: fireUser.uid,
					dashboardUser: user,
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

	update(id: number, updateUserDto: UpdateUserDto) {
		return `This action updates a #${id} user`;
	}

	remove(id: number) {
		return `This action removes a #${id} user`;
	}
}
