import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UserProfile, UserProfilesRepository } from '@app/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
	private userRepository: UsersRepository;
	private userProfileRepository: UserProfilesRepository;
	constructor(@InjectEntityManager() private entityManager: EntityManager){
		this.userRepository = new UsersRepository(this.entityManager);
		this.userProfileRepository = new UserProfilesRepository(this.entityManager);
	}
	async create(createUserDto: CreateUserDto) {
		const user = new User();
		user.firstName = createUserDto.firstName;
		user.lastName = createUserDto.lastName;

		const userProfile: UserProfile = {
			email: createUserDto.email,
			dashboardUser: user
		}
		const data = await this.userProfileRepository.createEntity(userProfile);
		return data;
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
