import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../repositories/repositories.module';
import { PermissionsService } from './permissions.service';
import { CommonProfile } from '../profiles/common-profile';
import { FeaturePermissionService } from './feature-permission.service';
import { FeaturesPermissionRepository } from '../repositories/features-permission.repository';

@Module({
	imports: [RepositoriesModule],
	providers: [
		PermissionsService,
		CommonProfile,
		FeaturePermissionService,
		FeaturesPermissionRepository,
	],
	exports: [PermissionsService],
})
export class PermissionsModule {}
