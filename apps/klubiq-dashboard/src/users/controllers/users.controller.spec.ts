import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { EntityManager } from 'typeorm';
import { UsersRepository } from '../repositories/users.repository';
import { RolesRepository } from '@app/common/repositories/roles.repository';
import { UserProfilesRepository } from '@app/common/repositories/user-profiles.repository';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { Mapper, createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { AuthService } from '@app/auth';

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
				UsersRepository,
				RolesRepository,
				UserProfilesRepository,
				{
					provide: getMapperToken('MAPPER'),
					useValue: createMapper({
						strategyInitializer: classes(),
					}),
				},
			],
		})
			.overrideProvider(AuthService)
			.useValue('')
			.compile();

		mapper = module.get<Mapper>(getMapperToken('MAPPER'));
		controller = module.get<UsersController>(UsersController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
