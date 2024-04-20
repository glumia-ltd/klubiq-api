import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { BaseRepository } from '@app/common';
import { Mapper, createMap, createMapper } from '@automapper/core';
import { Property } from '../entities/property.entity';
import { PropertyRepository } from '../repositories/properties.repository';
import { PropertyDto } from '../dto/property-response.dto';
import { getMapperToken } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { EntityManager } from 'typeorm';

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
					provide: getMapperToken(),
					useValue: createMapper({
						strategyInitializer: classes(),
					}),
				},
			],
		}).compile();

		mapper = module.get<Mapper>(getMapperToken());
		// propertyRepository = module.get<MockRepository>(PropertyRepository);
		service = module.get<PropertiesService>(PropertiesService);
		createMap(mapper, Property, PropertyDto);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});