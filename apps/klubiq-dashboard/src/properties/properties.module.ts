import { Module } from '@nestjs/common';
import { PropertiesService } from './services/properties.service';
import { PropertiesController } from './controllers/properties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyAddress } from './entities/property-address.entity';
import { PropertyProfile } from './profiles/property.profile';
import { RepositoriesModule } from '@app/common';
import { PropertyRepository } from './repositories/properties.repository';
import { PROPERTY_METRICS } from './services/interfaces/property-metrics.service.interface';

@Module({
	providers: [
		PropertyProfile,
		PropertiesService,
		PropertyRepository,
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
