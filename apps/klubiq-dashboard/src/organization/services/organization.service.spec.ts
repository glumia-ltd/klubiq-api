import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { createMap, createMapper, Mapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { OrganizationResponseDto } from '../dto/responses/organization-response.dto';
import { Organization } from '@app/common/database/entities/organization.entity';

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
const mockOrganization = {
	name: 'test',
};

describe('OrganizationService', () => {
	let service: OrganizationService;
	let organizationRepository: MockRepository;
	let mapper: Mapper;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AutomapperModule],
			providers: [
				OrganizationService,
				EntityManager,
				{
					provide: OrganizationRepository,
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
		organizationRepository = module.get<MockRepository>(OrganizationRepository);
		service = module.get<OrganizationService>(OrganizationService);
		createMap(mapper, Organization, OrganizationResponseDto);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	describe('getOrganizationByUuId', () => {
		describe('when Organization with UuId exists', () => {
			it('should return the organization object', async () => {
				const uuid = 'XXXXXXXXXXXXXXXXXXXXXXXXXX';
				organizationRepository.findOneByCondition.mockReturnValue(
					mockOrganization,
				);
				const organization = await service.getOrganizationByUuId(uuid);
				expect(organization).toEqual(mockOrganization);
			});
		});

		describe('otherwise', () => {
			it('should throw the "NotFoundException"', async () => {
				const uuid = 'XXXXXXXXXXXXXXXXXXXXXXXXXX';
				organizationRepository.findOneByCondition.mockReturnValue(undefined);
				try {
					await service.getOrganizationByUuId(uuid);
				} catch (err) {
					expect(err.message).toContain('Error getting organization.');
					expect(err).toBeInstanceOf(Error);
				}
			});
		});
	});
});
