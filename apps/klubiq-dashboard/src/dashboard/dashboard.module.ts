import { Module } from '@nestjs/common';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { PROPERTY_METRICS } from '../properties/interfaces/property-metrics.service.interface';
import { PropertiesService } from '../properties/services/properties.service';
import { PropertyRepository } from '../properties/repositories/properties.repository';
import { Util } from '@app/common/helpers/util';
import { DashboardRepository } from './repositories/dashboard.repository';
import { FileDownloadService } from '@app/common/services/file-download.service';

@Module({
	imports: [RepositoriesModule],
	controllers: [DashboardController],
	providers: [
		DashboardRepository,
		DashboardService,
		Util,
		{
			provide: PROPERTY_METRICS,
			useClass: PropertiesService,
		},
		PropertyRepository,
		FileDownloadService,
	],
})
export class DashboardModule {}
