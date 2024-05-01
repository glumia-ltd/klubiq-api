import { Module } from '@nestjs/common';
import { PublicController } from './controllers/public.controller';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { OrganizationRolesRepository } from '../repositories/organization-roles.repository';
import { FeaturesRepository } from '../repositories/features.repository';
import { FeaturesService } from '../services/features.service';
import { PropertyCategoryRepository } from '../repositories/properties-category.repository';
import { PropertyPurposeRepository } from '../repositories/properties-purpose.repository';
import { PropertyStatusRepository } from '../repositories/properties-status.repository';
import { PropertyTypeRepository } from '../repositories/properties-type.repository';
import { PropertiesCategoryService } from '../services/properties-category.service';
import { PropertiesPurposeService } from '../services/properties-purpose.service';
import { PropertiesStatusService } from '../services/properties-status.service';
import { PropertiesTypeService } from '../services/properties-type.service';
import { PropertyMetadataController } from './controllers/properties-metadata.controller';
import { CacheService } from '../services/cache.service';
import { FeaturePermissionService } from '../permissions/feature-permission.service';
import { FeaturesPermissionRepository } from '../repositories/features-permission.repository';
import { PropertyMetaDataProfile } from '../profiles/property-metadata-profile';

@Module({
	controllers: [PublicController, PropertyMetadataController],
	providers: [
		PropertyMetaDataProfile,
		PermissionsService,
		PermissionsRepository,
		OrganizationRolesRepository,
		FeaturesRepository,
		FeaturesService,
		PropertiesCategoryService,
		PropertyCategoryRepository,
		PropertiesPurposeService,
		PropertyPurposeRepository,
		PropertiesTypeService,
		PropertyTypeRepository,
		PropertiesStatusService,
		PropertyStatusRepository,
		FeaturePermissionService,
		FeaturesPermissionRepository,
		{
			provide: CacheService,
			useFactory: () => new CacheService(null, 60 * 60 * 24),
		},
	],
})
export class PublicModule {}
