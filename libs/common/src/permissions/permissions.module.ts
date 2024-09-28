import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CommonProfile } from '../profiles/common-profile';
import { FeaturePermissionService } from './feature-permission.service';
import { RolesService } from './roles.service';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
	imports: [RepositoriesModule],
	providers: [
		CommonProfile,
		FeaturePermissionService,
		PermissionsService,
		RolesService,
	],
	exports: [PermissionsService, RolesService, FeaturePermissionService],
})
export class PermissionsModule {}
