import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { EntityManager } from 'typeorm';

describe('OrganizationService', () => {
	let service: OrganizationService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AutomapperModule],
			providers: [
				OrganizationService,
				OrganizationRepository,
				EntityManager,
				{
					provide: getMapperToken(),
					useValue: createMapper({
						strategyInitializer: classes(),
					}),
				},
			],
		}).compile();

		service = module.get<OrganizationService>(OrganizationService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
