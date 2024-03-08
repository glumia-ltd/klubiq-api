import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserRepository } from './users.repository';
import { UserProfile, UserProfileRepository } from '@app/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
	private userRepository: UserRepository;
	private userProfileRepository: UserProfileRepository;
	constructor(@InjectEntityManager() private entityManager: EntityManager){
		this.userRepository = new UserRepository(this.entityManager);
		this.userProfileRepository = new UserProfileRepository(this.entityManager);
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
