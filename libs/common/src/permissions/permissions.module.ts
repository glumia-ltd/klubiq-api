import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../repositories/repositories.module';
import { PermissionsService } from './permissions.service';
import { CommonProfile } from '../profiles/common-profile';
import { FeaturePermissionService } from './feature-permission.service';
import { FeaturesPermissionRepository } from '../repositories/features-permission.repository';
import { RolesService } from './roles.service';
import { RolesRepository } from '../repositories/roles.repository';
import { OrganizationRolesRepository } from '../repositories/organization-roles.repository';

@Module({
	imports: [RepositoriesModule],
	providers: [
		PermissionsService,
		CommonProfile,
		FeaturePermissionService,
		FeaturesPermissionRepository,
		RolesService,
		RolesRepository,
		OrganizationRolesRepository,
	],
	exports: [PermissionsService],
})
export class PermissionsModule {}
