import { Module } from '@nestjs/common';
import { UserProfilesRepository } from '../repositories/user-profiles.repository';
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
	],
	exports: [UserProfilesRepository, RolesRepository],
})
export class RepositoriesModule {}
