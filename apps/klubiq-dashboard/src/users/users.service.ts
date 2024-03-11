import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UserProfile, UserProfilesRepository } from '@app/common';
import { CreateOrganizationUserDto } from './dto/create-organization-user.dto';
import { UpdateOrganizationUserDto } from './dto/update-organization-user.dto';
import { OrganizationUser } from './entities/organization-user.entity';

@Injectable()
export class UsersService {
	private userRepository: UsersRepository;
	private userProfileRepository: UserProfilesRepository;
	constructor(@InjectEntityManager() private entityManager: EntityManager) {
		this.userRepository = new UsersRepository(this.entityManager);
		this.userProfileRepository = new UserProfilesRepository(this.entityManager);
	}
	async create(createOrgUserDto: CreateOrganizationUserDto) {
		const user = new OrganizationUser();
		user.firstName = createOrgUserDto.firstName;
		user.lastName = createOrgUserDto.lastName;

		const userProfile: UserProfile = {
			email: createOrgUserDto.email,
			organizationUser: user,
		};
		const data = await this.userProfileRepository.createEntity(userProfile);
		return data;
	}

	findAll() {
		return `This action returns all users`;
	}

	findOne(id: number) {
		return `This action returns a #${id} user`;
	}

	update(id: number, updateOrgUserDto: UpdateOrganizationUserDto) {
		return `This action updates a #${id} user`;
	}

	remove(id: number) {
		return `This action removes a #${id} user`;
	}
}
