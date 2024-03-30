import { Module } from '@nestjs/common';
import { UserProfilesRepository } from '../repositories/user-profiles.repository';
import { PermissionsRepository } from './permissions.repository';
import { FeaturesRepository } from './features.repository';
import { OrganizationRolesRepository } from './organization-roles.repository';
import { RolesRepository } from '../repositories/roles.repository';
import { EntityManager } from 'typeorm';

@Module({
	providers: [
		{
			provide: UserProfilesRepository,
			useFactory: (em: EntityManager) => new UserProfilesRepository(em),
			inject: [EntityManager],
		},
		{
			provide: RolesRepository,
			useFactory: (em: EntityManager) => new RolesRepository(em),
			inject: [EntityManager],
		},
		{
			provide: PermissionsRepository,
			useFactory: (em: EntityManager) => new PermissionsRepository(em),
			inject: [EntityManager],
		},
		{
			provide: FeaturesRepository,
			useFactory: (em: EntityManager) => new FeaturesRepository(em),
			inject: [EntityManager],
		},
		{
			provide: OrganizationRolesRepository,
			useFactory: (em: EntityManager) => new OrganizationRolesRepository(em),
			inject: [EntityManager],
		},
	],
	exports: [
		UserProfilesRepository,
		RolesRepository,
		PermissionsRepository,
		FeaturesRepository,
		OrganizationRolesRepository,
	],
})
export class RepositoriesModule {}
