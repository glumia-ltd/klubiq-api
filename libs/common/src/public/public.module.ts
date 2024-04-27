import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
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

@Module({
	controllers: [PublicController],
	providers: [
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
	],
})
export class PublicModule {}
