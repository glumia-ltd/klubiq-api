import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserProfilesRepository } from '@app/common';
import { OrganizationRepository } from 'apps/klubiq-dashboard/src/organization/organization.repository';
import { MailerSendService } from '@app/common/email/email.service';
import { MailerSendSMTPService } from '@app/common/email/smtp-email.service';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { Mapper, createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { ConfigService } from '@nestjs/config';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);
jest.mock('firebase-admin');
jest.mock('firebase/auth');

describe('AuthService', () => {
	let service: AuthService;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let mapper: Mapper;

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
			.overrideProvider(AuthService)
			.useValue('')
			.compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
