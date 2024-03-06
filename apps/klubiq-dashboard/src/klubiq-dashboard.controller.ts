import { Controller, Get } from '@nestjs/common';
import { KlubiqDashboardService } from './klubiq-dashboard.service';

@Controller()
export class KlubiqDashboardController {
  constructor(private readonly klubiqDashboardService: KlubiqDashboardService) {}

  @Get()
  getHello(): string {
    return this.klubiqDashboardService.getHello();
  }
}
