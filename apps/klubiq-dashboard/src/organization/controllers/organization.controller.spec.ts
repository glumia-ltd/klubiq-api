import { OrganizationRepository } from '../repositories/organization.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from '../services/organization.service';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { Mapper, createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { EntityManager } from 'typeorm';

describe('OrganizationController', () => {
	let controller: OrganizationController;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let mapper: Mapper;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AutomapperModule],
			controllers: [OrganizationController],
			providers: [
				OrganizationService,
				OrganizationRepository,
				EntityManager,
				{
					provide: getMapperToken('MAPPER'),
					useValue: createMapper({
						strategyInitializer: classes(),
					}),
				},
			],
		}).compile();

		mapper = module.get<Mapper>(getMapperToken('MAPPER'));
		controller = module.get<OrganizationController>(OrganizationController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
