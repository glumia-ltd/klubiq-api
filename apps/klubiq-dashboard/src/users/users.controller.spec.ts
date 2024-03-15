import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '@app/auth';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { OrganizationRepository } from '../organization/organization.repository';
import { RolesRepository, UserProfilesRepository } from '@app/common';

describe('UsersController', () => {
	let controller: UsersController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				UsersService,
				EntityManager,
				AuthService,
				UsersRepository,
				OrganizationRepository,
				RolesRepository,
				UserProfilesRepository,
			],
		})
			.overrideProvider(AuthService)
			.useValue('')
			.compile();

		controller = module.get<UsersController>(UsersController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
