import { Module } from '@nestjs/common';
import { OrganizationService } from './services/organization.service';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationRepository } from './repositories/organization.repository';
import { EntityManager } from 'typeorm';
import { OrganizationProfile } from './profiles/organization-profile';

@Module({
	controllers: [OrganizationController],
	providers: [
		OrganizationService,
		OrganizationProfile,
		{
			provide: OrganizationRepository,
			useFactory: (em: EntityManager) => new OrganizationRepository(em),
			inject: [EntityManager],
		},
	],
	exports: [OrganizationRepository, OrganizationService],
})
export class OrganizationModule {}
