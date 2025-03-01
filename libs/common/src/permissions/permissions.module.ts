import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CommonProfile } from '../profiles/common-profile';
import { FeaturePermissionService } from './feature-permission.service';
import { RolesService } from './roles.service';
import { RepositoriesModule } from '../repositories/repositories.module';
import { RoleFeaturePermissionService } from './role-feature-permission.service';

@Module({
	imports: [RepositoriesModule],
	providers: [
		CommonProfile,
		FeaturePermissionService,
		PermissionsService,
		RolesService,
		RoleFeaturePermissionService,
	],
	exports: [
		PermissionsService,
		RolesService,
		FeaturePermissionService,
		RoleFeaturePermissionService,
	],
})
export class PermissionsModule {}
