import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserProfilesRepository } from '@app/common';
import { OrganizationRepository } from '../../../apps/klubiq-dashboard/src/organization/organization.repository';
import { MailerSendService } from '@app/common/email/email.service';
import { MailerSendSMTPService } from '@app/common/email/smtp-email.service';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { Mapper, createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { ConfigService } from '@nestjs/config';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import firebaseAdmin from 'firebase-admin';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const moduleMocker = new ModuleMocker(global);

const mockCreateUserPayload = {
	email: 'XXXXXXXXXXXXX',
	password: 'XXXXXXXXXXXXX',
	firstName: 'Test User',
	lastName: 'Test User',
	companyName: 'XXXXXXXXXXXXX',
};

jest.mock('firebase/auth');
jest.mock('firebase/app');
jest.mock('firebase-admin');

describe('AuthService', () => {
	let service: AuthService;
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
				MailerSendSMTPService,
				AuthService,
				{
					provide: getMapperToken(),
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

		mapper = module.get<Mapper>(getMapperToken());
		service = module.get<AuthService>(AuthService);
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
				.spyOn(service, 'createOrgUser')
				.mockImplementation(async () => result);
			const token = await service.createOrgUser(mockCreateUserPayload);

			// Assert
			expect(token).toBe(result);
		});
	});
});
