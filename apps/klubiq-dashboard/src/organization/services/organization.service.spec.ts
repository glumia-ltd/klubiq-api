import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { createMap, createMapper, Mapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { EntityManager } from 'typeorm';
import {
	BaseRepository,
	//Order
} from '@app/common';
import { OrganizationResponseDto } from '../dto/responses/organization-response.dto';
import { Organization } from '../entities/organization.entity';

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
// const mockOrgList: Organization[] = [];
const organizationPayload = {
	name: 'test',
	email: 'XXXXXXXXXXXXX@xxx.com',
	website: 'www.xxx.com',
};

// const findAllPayload = {
// 	order: Order.ASC,
// 	page: 1,
// 	take: 10,
// 	skip: 0,
// };

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

	describe('getOrganizationById', () => {
		describe('when Organization with Id exists', () => {
			it('should return the organization object', async () => {
				const id = 1;
				organizationRepository.findOneWithId.mockReturnValue(mockOrganization);
				const organization = await service.getOrganizationById(id);
				expect(organization).toEqual(mockOrganization);
			});
		});

		describe('otherwise', () => {
			it('should throw the "NotFoundException"', async () => {
				const id = 1;
				organizationRepository.findOneWithId.mockReturnValue(undefined);
				try {
					await service.getOrganizationById(id);
				} catch (err) {
					expect(err.message).toContain('Error getting organization.');
					expect(err).toBeInstanceOf(Error);
				}
			});
		});
	});

	describe('create', () => {
		describe('Creates new organization', () => {
			it('should create and return the organization object', async () => {
				organizationRepository.createEntity.mockReturnValue(
					organizationPayload,
				);
				const organization = await service.create(organizationPayload);
				expect(organization).toEqual(organizationPayload);
			});
		});

		describe('otherwise', () => {
			it('should throw an error', async () => {
				organizationRepository.createEntity.mockReturnValue(undefined);
				try {
					await service.create(organizationPayload);
				} catch (err) {
					expect(err.message).toContain('Error creating organization.');
					expect(err).toBeInstanceOf(Error);
				}
			});
		});
	});

	// 	describe('Finds all organization', () => {
	// 		it('should return a list of organization object', async () => {
	// 			const org1 = {
	// 				name: 'test',
	// 				email: 'XXXXXXXXXXXXX@xxx.com',
	// 			};
	// 			const org2 = {
	// 				name: 'test2',
	// 				email: 'AXXXXXXXXXXXXX@xxx.com',
	// 			};
	// 			const mockFindAllOrganization = {
	// 				pageData: [org1, org2],
	// 				meta: {
	// 					page: 1,
	// 					take: 10,
	// 					itemCount: 2,
	// 					pageCount: 1,
	// 					hasPreviousPage: false,
	// 					hasNextPage: false,
	// 				},
	// 			};
	// 			mockOrgList.push(org1, org2);
	// 			const dataQueryBuilder = organizationRepository.createQueryBuilder;
	// 			dataQueryBuilder.mockImplementation(() => {
	// 				return {
	// 					orderBy: jest.fn().mockReturnThis(),
	// 					skip: jest.fn().mockReturnThis(),
	// 					take: jest.fn().mockReturnThis(),
	// 					getCount: jest.fn().mockReturnThis(),
	// 					getRawAndEntities: jest.fn().mockReturnThis(),
	// 				};
	// 			});
	// 			dataQueryBuilder.mockReturnValue(mockOrgList);
	// 			// .mockReturnValue({
	// 			// 	orderBy: jest.fn().mockReturnThis(),
	// 			// 	skip: jest.fn().mockReturnThis(),
	// 			// 	take: jest.fn().mockReturnThis(),
	// 			// 	getCount: jest.fn().mockReturnValue(2),
	// 			// 	getRawAndEntities: jest.fn().mockReturnValue(mockOrgList),
	// 			// });

	// 			const organizations = await service.findAll(findAllPayload);
	// 			expect(organizations).toEqual(mockFindAllOrganization);
	// 		});
	// 	});

	// 	describe('otherwise', () => {
	// 		it('should throw an error', async () => {
	// 			organizationRepository.createEntity.mockReturnValue(undefined);
	// 			try {
	// 				await service.create(organizationPayload);
	// 			} catch (err) {
	// 				expect(err.message).toContain('Error creating organization.');
	// 				expect(err).toBeInstanceOf(Error);
	// 			}
	// 		});
	// 	});
	// });
});
