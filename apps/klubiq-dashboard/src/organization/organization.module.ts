import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from './entities/organization.entity';
import { OrganizationRepository } from './organization.repository';
import { EntityManager } from 'typeorm';

@Module({
	controllers: [OrganizationController],
	providers: [
		OrganizationService,
		{
			provide: OrganizationRepository,
			useFactory: (em: EntityManager) => new OrganizationRepository(em),
			inject: [EntityManager],
		},
	],
	imports: [
		TypeOrmModule.forFeature([Organization])
	],
	exports: [OrganizationRepository],
})
export class OrganizationModule {}
