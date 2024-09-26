import { Module } from '@nestjs/common';
import { PropertiesService } from './services/properties.service';
import { PropertiesController } from './controllers/properties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyAddress } from './entities/property-address.entity';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { PropertyRepository } from './repositories/properties.repository';
import { PROPERTY_METRICS } from './interfaces/property-metrics.service.interface';
import { Util } from '@app/common/helpers/util';
import { Unit } from './entities/unit.entity';
import { SubscriptionModule } from '@app/common/public/subscription/subscription.module';
import { CommonConfigService } from '@app/common/config/common-config';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from '@app/common/services/file-upload.service';

@Module({
	providers: [
		PropertiesService,
		PropertyRepository,
		Util,
		ConfigService,
		CommonConfigService,
		FileUploadService,
		{
			provide: PROPERTY_METRICS,
			useClass: PropertiesService,
		},
	],
	controllers: [PropertiesController],
	imports: [
		TypeOrmModule.forFeature([Property, PropertyAddress, Unit]),
		RepositoriesModule,
		SubscriptionModule,
	],
	exports: [PROPERTY_METRICS, PropertyRepository],
})
export class PropertiesModule {}
