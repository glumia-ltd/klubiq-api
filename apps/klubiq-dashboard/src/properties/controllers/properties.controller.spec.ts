/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { Mapper, createMapper } from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { EntityManager } from 'typeorm';
import { PropertyRepository } from '../repositories/properties.repository';
import { PropertiesService } from '../services/properties.service';
import { ClsService } from 'nestjs-cls';
import { AsyncLocalStorage } from 'async_hooks';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('OrganizationController', () => {
	let controller: PropertiesController;
	let mapper: Mapper;
	let cls: ClsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AutomapperModule],
			controllers: [PropertiesController],
			providers: [
				PropertiesService,
				PropertyRepository,
				EntityManager,
				{
					provide: getMapperToken('MAPPER'),
					useValue: createMapper({
						strategyInitializer: classes(),
					}),
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

		mapper = module.get<Mapper>(getMapperToken('MAPPER'));
		controller = module.get<PropertiesController>(PropertiesController);
		cls = module.get<ClsService>(ClsService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
