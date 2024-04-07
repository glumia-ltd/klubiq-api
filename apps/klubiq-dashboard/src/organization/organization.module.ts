import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from './entities/organization.entity';
import { OrganizationRepository } from './organization.repository';
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
	imports: [TypeOrmModule.forFeature([Organization])],
	exports: [OrganizationRepository, OrganizationService],
})
export class OrganizationModule {}
