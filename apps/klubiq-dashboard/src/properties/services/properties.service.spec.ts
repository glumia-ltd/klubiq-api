/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { Mapper, createMap, createMapper } from '@automapper/core';
import { Property } from '@app/common/database/entities/property.entity';
import { PropertyRepository } from '../repositories/properties.repository';
import { EntityManager } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { AsyncLocalStorage } from 'async_hooks';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

type MockRepository<T = any> = Partial<
	Record<keyof BaseRepository<T>, jest.Mock>
>;

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
// const mockProperty = {
// 	name: 'test',
// };

// const propertyPayload = {
// 	name: 'test',
// 	description: 'bla bla blaa',
// };

describe('PropertiesService', () => {
	let service: PropertiesService;
	// let propertyRepository: MockRepository;
	let mapper: Mapper;
	let cls: ClsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PropertiesService,
				EntityManager,
				{
					provide: PropertyRepository,
					useValue: createMockRepository(),
				},
				{
					provide: ClsService,
					useFactory: () => new ClsService(new AsyncLocalStorage()),
				},
				{
					provide: CACHE_MANAGER,
					useFactory: () => ({
						get: jest.fn(),
						set: jest.fn(),
						del: jest.fn(),
					}),
				},
			],
		}).compile();
		// propertyRepository = module.get<MockRepository>(PropertyRepository);
		service = module.get<PropertiesService>(PropertiesService);
		cls = module.get<ClsService>(ClsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
