import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { OrganizationRepository } from '../organization/organization.repository';
import { RolesRepository, UserProfilesRepository } from '@app/common';

describe('UsersService', () => {
	let service: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				EntityManager,
				UsersRepository,
				OrganizationRepository,
				RolesRepository,
				UserProfilesRepository,
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
