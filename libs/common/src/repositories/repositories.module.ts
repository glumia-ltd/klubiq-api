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
import {
	OrganizationCounterRepository,
	OrganizationSubscriptionRepository,
	SubscriptionPlanRepository,
} from './subscription.repository';
import { FeaturesPermissionRepository } from './features-permission.repository';
import { PropertyAmenityRepository } from './property-amenity.repository';
import { OrganizationSettingsRepository } from './organization-settings.repository';

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
		{
			provide: OrganizationSubscriptionRepository,
			useFactory: (em: EntityManager) =>
				new OrganizationSubscriptionRepository(em),
			inject: [EntityManager],
		},
		{
			provide: OrganizationCounterRepository,
			useFactory: (em: EntityManager) => new OrganizationCounterRepository(em),
			inject: [EntityManager],
		},
		{
			provide: SubscriptionPlanRepository,
			useFactory: (em: EntityManager) => new SubscriptionPlanRepository(em),
			inject: [EntityManager],
		},
		{
			provide: FeaturesPermissionRepository,
			useFactory: (em: EntityManager) => new FeaturesPermissionRepository(em),
			inject: [EntityManager],
		},
		{
			provide: PropertyAmenityRepository,
			useFactory: (em: EntityManager) => new PropertyAmenityRepository(em),
			inject: [EntityManager],
		},
		{
			provide: OrganizationSettingsRepository,
			useFactory: (em: EntityManager) => new OrganizationSettingsRepository(em),
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
		OrganizationSubscriptionRepository,
		OrganizationCounterRepository,
		SubscriptionPlanRepository,
		FeaturesPermissionRepository,
		PropertyAmenityRepository,
		OrganizationSettingsRepository,
	],
})
export class RepositoriesModule {}
