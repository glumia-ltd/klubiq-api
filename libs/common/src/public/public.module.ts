import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { PublicController } from './controllers/public.controller';
import { FeaturesService } from '../services/features.service';
import { PropertiesCategoryService } from '../services/properties-category.service';
import { PropertiesPurposeService } from '../services/properties-purpose.service';
import { PropertiesStatusService } from '../services/properties-status.service';
import { PropertiesTypeService } from '../services/properties-type.service';
import { PropertyMetadataController } from './controllers/properties-metadata.controller';

import { PropertyMetaDataProfile } from '../profiles/property-metadata-profile';

import { PropertiesAmenityService } from '../services/properties-amenity.service';

@Module({
	controllers: [PublicController, PropertyMetadataController],
	providers: [
		PropertyMetaDataProfile,
		FeaturesService,
		PropertiesCategoryService,
		PropertiesPurposeService,
		PropertiesTypeService,
		PropertiesStatusService,
		PropertiesAmenityService,
	],
	imports: [PermissionsModule, RepositoriesModule],
})
export class PublicModule {}
