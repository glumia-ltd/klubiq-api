/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { EntityManager } from 'typeorm';
import { UsersRepository } from './users.repository';
import {
	RolesRepository,
	UserProfile,
	UserProfilesRepository,
} from '@app/common';
import { classes } from '@automapper/classes';
import { createMapper, Mapper } from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { BaseRepository } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { NotFoundException } from '@nestjs/common';
import { object } from 'joi';

type MockRepository<T = any> = Partial<
	Record<keyof BaseRepository<T>, jest.Mock>
>;

const mockOrganizationUser = {
	firebaseId: 'XAVERIK34566',
	firstName: 'Xavier',
	lastName: 'Rivera',
};

const mockUserProfile = {
	firebaseId: 'XAVERIK34566',
	email: 'XXXXXXXXXXXXXXXX@test.com',
};
const createMockRepository = <T = any>(): MockRepository<T> => ({
	save: jest.fn(),
	delete: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	count: jest.fn(),
	query: jest.fn(),
	manager: jest.fn(),
	findAll: jest.fn(),
	createEntity: jest.fn(),
	findOneByCondition: jest.fn(),
	findOneWithId: jest.fn(),
	createQueryBuilder: jest.fn(() => {
		return {
			orderBy: jest.fn().mockReturnThis(),
			skip: jest.fn().mockReturnThis(),
			take: jest.fn().mockReturnThis(),
			getCount: jest.fn().mockReturnThis(),
			getRawAndEntities: jest.fn().mockReturnThis(),
		};
	}),
});

describe('UsersService', () => {
	let service: UsersService;
	let mapper: Mapper;
	let userRepo: MockRepository;
	let roleRepo: MockRepository;
	let userProfileRepo: MockRepository;
	let entityManager: MockRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AutomapperModule],
			providers: [
				UsersService,
				{
					provide: UsersRepository,
					useValue: createMockRepository(),
				},
				{
					provide: EntityManager,
					useValue: createMockRepository(),
				},
				{
					provide: RolesRepository,
					useValue: createMockRepository(),
				},
				{
					provide: UserProfilesRepository,
					useValue: createMockRepository(),
				},
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
		userRepo = module.get<MockRepository>(UsersRepository);
		roleRepo = module.get<MockRepository>(RolesRepository);
		userProfileRepo = module.get<MockRepository>(UserProfilesRepository);
		entityManager = module.get<MockRepository>(EntityManager);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
