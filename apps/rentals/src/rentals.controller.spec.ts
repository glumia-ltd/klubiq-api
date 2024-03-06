import { Test, TestingModule } from '@nestjs/testing';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';

describe('RentalsController', () => {
  let rentalsController: RentalsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RentalsController],
      providers: [RentalsService],
    }).compile();

    rentalsController = app.get<RentalsController>(RentalsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(rentalsController.getHello()).toBe('Hello World!');
    });
  });
});
