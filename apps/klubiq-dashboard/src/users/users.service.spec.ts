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
					provide: getMapperToken('MAPPER'),
					useValue: createMapper({
						strategyInitializer: classes(),
					}),
				},
			],
		}).compile();

		mapper = module.get<Mapper>(getMapperToken('MAPPER'));
		service = module.get<UsersService>(UsersService);
		userRepo = module.get<MockRepository>(UsersRepository);
		roleRepo = module.get<MockRepository>(RolesRepository);
		userProfileRepo = module.get<MockRepository>(UserProfilesRepository);
		entityManager = module.get<MockRepository>(EntityManager);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	describe('getUserByFireBaseId', () => {
		describe('when user with firebaseId exists', () => {
			it('should return the organization user object', async () => {
				const testFirebaseId = 'XAVERIK34566';
				userRepo.findOneByCondition.mockReturnValue(mockOrganizationUser);
				const user = await service.getUserByFireBaseId(testFirebaseId);
				expect(user).toEqual(mockOrganizationUser);
				expect(user.firebaseId).toEqual(testFirebaseId);
				expect(user).toBeInstanceOf(Object);
			});
		});

		describe('when user with firebaseId does not exist', () => {
			it('should throw a "NotFoundException', async () => {
				const testFirebaseId = 'XXXXXXXXXX9234343';
				userRepo.findOneByCondition.mockReturnValue(undefined);
				try {
					await service.getUserByFireBaseId(testFirebaseId);
				} catch (err) {
					expect(err.message).toEqual('No data found');
					expect(err).toBeInstanceOf(NotFoundException);
				}
			});
		});
	});

	describe('findByEmail', () => {
		describe('when user with email exists', () => {
			it('should return the user profile object', async () => {
				const testEmail = 'XXXXXXXXXXXXXXXX@test.com';
				userProfileRepo.findOneByCondition.mockReturnValue(mockUserProfile);
				const user = await service.findByEmail(testEmail);
				expect(user).toEqual(mockUserProfile);
				expect(user.email).toEqual(testEmail);
				expect(user).toBeInstanceOf(Object);
			});
		});
		describe('when user with email does not exist', () => {
			it('should throw a "NotFoundException', async () => {
				const testEmail = 'XXXXXXXXXXXXXXXX@test.com';
				userRepo.findOneByCondition.mockReturnValue(undefined);
				try {
					await service.getUserByFireBaseId(testEmail);
				} catch (err) {
					expect(err.message).toEqual('No data found');
					expect(err).toBeInstanceOf(NotFoundException);
				}
			});
		});
	});
});
