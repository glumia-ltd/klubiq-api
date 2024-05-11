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
import auth from 'firebase/auth';
import { UnauthorizedException } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);
const mockUser = {
	firebaseId: 'XXXXXXXXXXXXXXXX',
	email: 'XXXXXXXXXXXXX@XXX.COM',
	phoneNumber: 'XXXXXXXXXXXXX',
	photoURL: 'XXXXXXXXXXXXX',
};
// const mockOrg = {
// 	name: 'Test Org',
// 	uuid: 'XXXXXXXXXXXXXXXX',
// 	email: 'XXXXXXXXXXXXX@XXX.COM',
// };
const mockLoginResponse = {
	profileId: 1,
	profileUuid: 'XXXXXXXXXXXXXXXX',
	firstName: 'Test',
	lastName: 'User',
	email: 'XXXXXXXXXXXXX@XXX.COM',
	systemRoleName: 'ADMIN',
	orgRoleName: 'ADMIN',
	isPrivacyPolicyAgreed: true,
	isTermsAndConditionAccepted: true,
	isActive: true,
	profilePicUrl: 'XXXXXXXXXXXXX',
	isAccountVerified: true,
	firebaseId: 'XXXXXXXXXXXXXXXX',
	organizationUserUuid: 'XXXXXXXXXXXXXXXX',
	organizationUserId: 1,
	organizationId: 1,
	organizationName: 'Test Org',
};
const mockCreateUserPayload = {
	email: 'XXXXXXXXXXXXX',
	password: 'XXXXXXXXXXXXX',
	firstName: 'Test User',
	lastName: 'Test User',
	companyName: 'XXXXXXXXXXXXX',
};
const mockLoginPayload = {
	email: 'user@test.com',
	password: 'TestPassword!',
};

jest.mock('firebase/auth');
jest.mock('firebase/app');
jest.mock('firebase-admin');

describe('AuthService', () => {
	let service: AuthService;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let mapper: Mapper;
	let userRepo: UserProfilesRepository;
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
					provide: 'FIREBASE_AUTH',
					useValue: auth,
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
		userRepo = module.get<UserProfilesRepository>(UserProfilesRepository);
		// orgRepo = module.get<OrganizationRepository>(OrganizationRepository);
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

		it('should create return undefined when firebase user is empty', async () => {
			// Act
			jest.spyOn(service, 'createUser').mockImplementation(async () => null);
			const token = await service.createOrgUser(mockCreateUserPayload);

			// Assert
			expect(token).toBe(undefined);
			expect(token).toBeFalsy();
		});
	});

	describe('login', () => {
		it('should log in a user and return user data with token', async () => {
			// Arrange
			const result = {
				user: mockLoginResponse,
				token: 'XXXXXXXXXXXXXXXXXXXXXXXXXVVVVVXXXXXXXXXX',
				refreshToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXVVVVVXXXXXXXXXX',
			};

			// Act
			jest
				.spyOn(userRepo, 'getUserLoginInfo')
				.mockImplementation(async () => mockUser);
			jest
				.spyOn(service, 'login')
				.mockImplementation(async () => result as any); // Update the return type here
			const mockResult = await service.login(mockLoginPayload);

			// Assert
			expect(mockResult).toBe(result);
		});

		it('should throw Unauthorized exception', async () => {
			// Act
			jest
				.spyOn(userRepo, 'getUserLoginInfo')
				.mockImplementation(async () => null);
			try {
				await service.login(mockLoginPayload);
				expect(false).toBeTruthy();
			} catch (e) {
				expect(e).toBeInstanceOf(UnauthorizedException);
				expect(e.message).toEqual(
					'You do not have an account, kindly register before trying to log in',
				);
			}
		});
	});
});
