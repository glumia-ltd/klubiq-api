import { Module } from '@nestjs/common';
import { PropertiesService } from './services/properties.service';
import { PropertiesController } from './controllers/properties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyAddress } from './entities/property-address.entity';
import { PropertyRepository } from './repositories/properties.repository';
import { PropertyCategoryRepository } from '../../../../libs/common/src/repositories/properties-category.repository';
import { PropertiesCategoryService } from '../../../../libs/common/src/services/properties-category.service';
import { PropertyPurposeRepository } from '../../../../libs/common/src/repositories/properties-purpose.repository';
import { PropertyStatusRepository } from '../../../../libs/common/src/repositories/properties-status.repository';
import { PropertyTypeRepository } from '../../../../libs/common/src/repositories/properties-type.repository';
import { PropertiesPurposeService } from '../../../../libs/common/src/services/properties-purpose.service';
import { PropertiesStatusService } from '../../../../libs/common/src/services/properties-status.service';
import { PropertiesTypeService } from '../../../../libs/common/src/services/properties-type.service';
import { PropertyCategoryController } from './controllers/properties-category.controller';
import { PropertyPurposeController } from './controllers/properties-purpose.controller';
import { PropertyStatusController } from './controllers/properties-status.controller';
import { PropertyTypeController } from './controllers/properties-type.controller';
import { PropertyProfile } from './profiles/property.profile';
import { RepositoriesModule } from '@app/common';

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
	imports: [
		TypeOrmModule.forFeature([Property, PropertyAddress]),
		RepositoriesModule,
	],
})
export class PropertiesModule {}
