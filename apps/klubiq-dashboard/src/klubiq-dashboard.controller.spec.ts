import { Test, TestingModule } from '@nestjs/testing';
import { KlubiqDashboardController } from './klubiq-dashboard.controller';
import { KlubiqDashboardService } from './klubiq-dashboard.service';

describe('KlubiqDashboardController', () => {
	let klubiqDashboardController: KlubiqDashboardController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [KlubiqDashboardController],
			providers: [KlubiqDashboardService],
		}).compile();

		klubiqDashboardController = app.get<KlubiqDashboardController>(
			KlubiqDashboardController,
		);
	});

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(klubiqDashboardController.getHello()).toBe('Hello World!');
		});
	});
});
