import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsSubscriptionService } from './services/notifications-subscription.service';

describe('NotificationsSubscriptionService', () => {
	let service: NotificationsSubscriptionService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [NotificationsSubscriptionService],
		}).compile();

		service = module.get<NotificationsSubscriptionService>(
			NotificationsSubscriptionService,
		);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
