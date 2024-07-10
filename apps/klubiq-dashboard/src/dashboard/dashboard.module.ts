import { Module } from '@nestjs/common';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { PROPERTY_METRICS } from '../properties/interfaces/property-metrics.service.interface';
import { PropertiesService } from '../properties/services/properties.service';
import { PropertyRepository } from '../properties/repositories/properties.repository';

@Module({
	imports: [RepositoriesModule],
	controllers: [DashboardController],
	providers: [
		DashboardService,
		{
			provide: PROPERTY_METRICS,
			useClass: PropertiesService,
		},
		PropertyRepository,
	],
})
export class DashboardModule {}
