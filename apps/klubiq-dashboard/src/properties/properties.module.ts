import { Module } from '@nestjs/common';
import { PropertiesService } from './services/properties.service';
import { PropertiesController } from './controllers/properties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyAddress } from './entities/property-address.entity';
import { PropertyRepository } from './repositories/properties.repository';
import { PropertyCategoryRepository } from './repositories/properties-category.repository';
import { PropertiesCategoryService } from './services/properties-category.service';
import { PropertyPurposeRepository } from './repositories/properties-purpose.repository';
import { PropertyStatusRepository } from './repositories/properties-status.repository';
import { PropertyTypeRepository } from './repositories/properties-type.repository';
import { PropertiesPurposeService } from './services/properties-purpose.service';
import { PropertiesStatusService } from './services/properties-status.service';
import { PropertiesTypeService } from './services/properties-type.service';
import { PropertyCategoryController } from './controllers/properties-category.controller';
import { PropertyPurposeController } from './controllers/properties-purpose.controller';
import { PropertyStatusController } from './controllers/properties-status.controller';
import { PropertyTypeController } from './controllers/properties-type.controller';
import { PropertyProfile } from './profiles/property.profile';

@Module({
	providers: [
		PropertyProfile,
		PropertiesService,
		PropertyRepository,
		PropertiesCategoryService,
		PropertyCategoryRepository,
		PropertiesPurposeService,
		PropertyPurposeRepository,
		PropertiesTypeService,
		PropertyTypeRepository,
		PropertiesStatusService,
		PropertyStatusRepository,
	],
	controllers: [
		PropertiesController,
		PropertyCategoryController,
		PropertyPurposeController,
		PropertyTypeController,
		PropertyStatusController,
	],
	imports: [TypeOrmModule.forFeature([Property, PropertyAddress])],
})
export class PropertiesModule {}
