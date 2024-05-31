import { Module } from '@nestjs/common';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { DatabaseModule } from '@app/common/database/database.module';
import { ConfigModule } from '@app/common/config/config.module';
import { AuthModule } from '@app/auth/auth.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
	imports: [DatabaseModule, RepositoriesModule, ConfigModule, AuthModule],
	controllers: [DashboardController],
	providers: [DashboardService],
})
export class DashboardModule {}
