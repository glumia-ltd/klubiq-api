import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import { OrganizationRepository } from '../organization/organization.repository';
import { RolesRepository, UserProfilesRepository } from '@app/common';
import { classes } from '@automapper/classes';
import { createMapper, Mapper } from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';

describe('UsersService', () => {
	let service: UsersService;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let mapper: Mapper;
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AutomapperModule],
			providers: [
				UsersService,
				EntityManager,
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
		}).compile();

		mapper = module.get<Mapper>(getMapperToken());
		service = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
