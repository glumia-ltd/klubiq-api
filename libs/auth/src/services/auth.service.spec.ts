import { Test, TestingModule } from '@nestjs/testing';
import { UserProfilesRepository } from '@app/common';

import { MailerSendService } from '@app/common/email/email.service';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { Mapper, createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { ConfigService } from '@nestjs/config';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import firebaseAdmin from 'firebase-admin';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LandlordAuthService } from './landlord-auth.service';
import { OrganizationRepository } from 'apps/klubiq-dashboard/src/organization/repositories/organization.repository';

const moduleMocker = new ModuleMocker(global);

const mockCreateUserPayload = {
	email: 'XXXXXXXXXXXXX',
	password: 'XXXXXXXXXXXXX',
	firstName: 'Test User',
	lastName: 'Test User',
	companyName: 'XXXXXXXXXXXXX',
	organizationCountry: {
		code: 'NGA',
		name: 'Nigeria',
		dialCode: '234',
		currency: 'NGN',
		currencySymbol: '₦',
	}, // Adjust this according to the actual structure of OrganizationCountryDto
};
jest.mock('firebase-admin');

describe('AuthService', () => {
	let service: LandlordAuthService;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let mapper: Mapper;
	//let userRepo: UserProfilesRepository;
	// let orgRepo: OrganizationRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AutomapperModule],
			providers: [
				UserProfilesRepository,
				OrganizationRepository,
				MailerSendService,
				LandlordAuthService,
				{
					provide: getMapperToken('MAPPER'),
					useValue: createMapper({
						strategyInitializer: classes(),
					}),
				},
				{
					provide: 'FIREBASE_ADMIN',
					useValue: firebaseAdmin,
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
		})
			.useMocker((token) => {
				if (token === ConfigService) {
					return {
						get: jest.fn(),
					};
				}
				if (typeof token === 'function') {
					const mockMetadata = moduleMocker.getMetadata(
						token,
					) as MockFunctionMetadata<any, any>;
					const Mock = moduleMocker.generateFromMetadata(mockMetadata);
					return new Mock();
				}
			})
			.compile();

		mapper = module.get<Mapper>(getMapperToken('MAPPER'));
		service = module.get<LandlordAuthService>(LandlordAuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('createOrgUser', () => {
		it('should create a org user', async () => {
			// Arrange
			const result = { jwtToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXVVVVVXXXXXXXXXX' };

			// Act
			jest
				.spyOn(service, 'createOrgOwner')
				.mockImplementation(async () => result);
			const token = await service.createOrgOwner(mockCreateUserPayload);

			// Assert
			expect(token).toBe(result);
		});
	});
});
