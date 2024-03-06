import { Module } from '@nestjs/common';
import { KlubiqDashboardController } from './klubiq-dashboard.controller';
import { KlubiqDashboardService } from './klubiq-dashboard.service';

@Module({
  imports: [],
  controllers: [KlubiqDashboardController],
  providers: [KlubiqDashboardService],
})
export class KlubiqDashboardModule {}
