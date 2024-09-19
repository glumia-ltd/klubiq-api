import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CommonProfile } from '../profiles/common-profile';
import { FeaturePermissionService } from './feature-permission.service';
import { RolesService } from './roles.service';
import { FeaturesPermissionRepository } from '../repositories/features-permission.repository';
import { OrganizationRolesRepository } from '../repositories/organization-roles.repository';
import { RolesRepository } from '../repositories/roles.repository';
import { PermissionsRepository } from '../repositories/permissions.repository';

@Module({
	//imports: [RepositoriesModule],
	providers: [
		CommonProfile,
		FeaturePermissionService,
		FeaturesPermissionRepository,
		OrganizationRolesRepository,
		PermissionsRepository,
		PermissionsService,
		RolesService,
		RolesRepository,
	],
	exports: [PermissionsService],
})
export class PermissionsModule {}
