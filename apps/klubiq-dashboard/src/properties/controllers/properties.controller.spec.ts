import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { Mapper, createMapper } from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { EntityManager } from 'typeorm';
import { PropertyRepository } from '../repositories/properties.repository';
import { PropertiesService } from '../services/properties.service';

describe('OrganizationController', () => {
	let controller: PropertiesController;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let mapper: Mapper;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AutomapperModule],
			controllers: [PropertiesController],
			providers: [
				PropertiesService,
				PropertyRepository,
				EntityManager,
				{
					provide: getMapperToken(),
					useValue: createMapper({
						strategyInitializer: classes(),
					}),
				},
			],
		}).compile();

		mapper = module.get<Mapper>(getMapperToken());
		controller = module.get<PropertiesController>(PropertiesController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
