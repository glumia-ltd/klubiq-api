import { Module } from '@nestjs/common';
import { UserProfilesRepository } from '../repositories/user-profiles.repository';
import { PermissionsRepository } from './permissions.repository';
import { FeaturesRepository } from './features.repository';
import { OrganizationRolesRepository } from './organization-roles.repository';
import { RolesRepository } from '../repositories/roles.repository';
import { EntityManager } from 'typeorm';
import { PropertyCategoryRepository } from './properties-category.repository';
import { PropertyStatusRepository } from './properties-status.repository';
import { PropertyTypeRepository } from './properties-type.repository';
import { PropertyPurposeRepository } from './properties-purpose.repository';

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
		{
			provide: PropertyCategoryRepository,
			useFactory: (em: EntityManager) => new PropertyCategoryRepository(em),
			inject: [EntityManager],
		},
		{
			provide: PropertyStatusRepository,
			useFactory: (em: EntityManager) => new PropertyStatusRepository(em),
			inject: [EntityManager],
		},
		{
			provide: PropertyTypeRepository,
			useFactory: (em: EntityManager) => new PropertyTypeRepository(em),
			inject: [EntityManager],
		},
		{
			provide: PropertyPurposeRepository,
			useFactory: (em: EntityManager) => new PropertyPurposeRepository(em),
			inject: [EntityManager],
		},
	],
	exports: [
		UserProfilesRepository,
		RolesRepository,
		PermissionsRepository,
		FeaturesRepository,
		OrganizationRolesRepository,
		PropertyCategoryRepository,
		PropertyStatusRepository,
		PropertyTypeRepository,
		PropertyPurposeRepository,
	],
})
export class RepositoriesModule {}
