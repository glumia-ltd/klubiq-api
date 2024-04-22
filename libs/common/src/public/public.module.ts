import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { OrganizationRolesRepository } from '../repositories/organization-roles.repository';
import { FeaturesRepository } from '../repositories/features.repository';

@Module({
	controllers: [PublicController],
	providers: [
		PermissionsService,
		PermissionsRepository,
		OrganizationRolesRepository,
		FeaturesRepository,
	],
})
export class PublicModule {}
