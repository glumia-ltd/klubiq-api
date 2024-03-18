import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '@app/auth';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { OrganizationRepository } from '../organization/organization.repository';
import { RolesRepository, UserProfilesRepository } from '@app/common';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { Mapper, createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';

describe('UsersController', () => {
	let controller: UsersController;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let mapper: Mapper;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AutomapperModule],
			controllers: [UsersController],
			providers: [
				UsersService,
				EntityManager,
				AuthService,
				UsersRepository,
				OrganizationRepository,
				RolesRepository,
				UserProfilesRepository,
				{
					provide: getMapperToken(),
					useValue: createMapper({
						strategyInitializer: classes(),
					}),
				},
			],
		})
			.overrideProvider(AuthService)
			.useValue('')
			.compile();

		mapper = module.get<Mapper>(getMapperToken());
		controller = module.get<UsersController>(UsersController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
