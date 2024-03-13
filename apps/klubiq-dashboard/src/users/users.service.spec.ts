import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { EntityManager } from 'typeorm';
import { AuthService } from '@app/auth';
import { UsersRepository } from './users.repository';
import { OrganizationRepository } from '../organization/organization.repository';
import { RolesRepository, UserProfilesRepository } from '@app/common';

describe('UsersService', () => {
	let service: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UsersService, EntityManager,
				AuthService, UsersRepository,
				OrganizationRepository, RolesRepository,
				UserProfilesRepository],
		}).overrideProvider(AuthService).useValue('').compile();

		service = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
