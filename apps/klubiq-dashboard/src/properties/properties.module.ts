import { Module } from '@nestjs/common';
import { PropertiesService } from './services/properties.service';
import { PropertiesController } from './controllers/properties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyAddress } from './entities/property-address.entity';
import { PropertyProfile } from './profiles/property.profile';
import { RepositoriesModule } from '@app/common';
import { PropertyRepository } from './repositories/properties.repository';
import { PROPERTY_METRICS } from './interfaces/property-metrics.service.interface';
import { Util } from '@app/common/helpers/util';

@Module({
	providers: [
		PropertyProfile,
		PropertiesService,
		PropertyRepository,
		Util,
		{
			provide: PROPERTY_METRICS,
			useClass: PropertiesService,
		},
	],
	controllers: [PropertiesController],
	imports: [
		TypeOrmModule.forFeature([Property, PropertyAddress]),
		RepositoriesModule,
	],
	exports: [PROPERTY_METRICS, PropertyRepository],
})
export class PropertiesModule {}
