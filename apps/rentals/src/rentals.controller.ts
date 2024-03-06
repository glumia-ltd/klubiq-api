import { Controller, Get } from '@nestjs/common';
import { RentalsService } from './rentals.service';

@Controller()
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  getHello(): string {
    return this.rentalsService.getHello();
  }
}
