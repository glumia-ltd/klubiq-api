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
import { SubscriptionModule } from '@app/common/public/subscription/subscription.module';
import { ConfigService } from '@nestjs/config';
import { CommonConfigService } from '@app/common/config/common-config';
import { LEASE_SERVICE_INTERFACE } from '../lease/interfaces/lease.interface';
import { LeaseService } from '../lease/services/lease.service';
import { LeaseRepository } from '../lease/repositories/lease.repository';
import { FileUploadService } from '@app/common/services/file-upload.service';

@Module({
	imports: [RepositoriesModule, SubscriptionModule],
	controllers: [DashboardController],
	providers: [
		DashboardRepository,
		DashboardService,
		Util,
		ConfigService,
		CommonConfigService,
		{
			provide: PROPERTY_METRICS,
			useClass: PropertiesService,
		},
		{
			provide: LEASE_SERVICE_INTERFACE,
			useClass: LeaseService,
		},
		PropertyRepository,
		LeaseRepository,
		FileDownloadService,
		FileUploadService,
	],
	exports: [
		DashboardService,
		DashboardRepository,
		// PROPERTY_METRICS,
		// PropertyRepository,
		// FileDownloadService,
	],
})
export class DashboardModule {}
