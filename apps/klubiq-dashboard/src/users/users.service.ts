import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UserProfilesRepository, Role, RolesRepository } from '@app/common';
import { AuthService } from '@app/auth';
import { OrganizationRepository } from '../organization/organization.repository';

// import { UpdateOrganizationUserDto } from './dto/update-organization-user.dto';
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
		return await this.usersRepository.findOneByCondition({
			organizationUserId: id,
		});
	}

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
