import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyAddress } from './entities/property-address.entity';
import { PropertyRepository } from './properties.repository';

@Module({
	providers: [PropertiesService, PropertyRepository],
	controllers: [PropertiesController],
	imports: [TypeOrmModule.forFeature([Property, PropertyAddress])],
})
export class PropertiesModule {}
