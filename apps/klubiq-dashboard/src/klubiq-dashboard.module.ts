import { Module } from '@nestjs/common';
import { KlubiqDashboardController } from './klubiq-dashboard.controller';
import { KlubiqDashboardService } from './klubiq-dashboard.service';
import { DatabaseModule } from '@app/common';
import { UserModule } from './user/user.module';

@Module({
	imports: [DatabaseModule, UserModule],
	controllers: [KlubiqDashboardController],
	providers: [KlubiqDashboardService],
})
export class KlubiqDashboardModule {}
