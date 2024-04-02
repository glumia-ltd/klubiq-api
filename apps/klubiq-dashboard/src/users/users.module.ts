import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { OrganizationModule } from '../organization/organization.module';
import { UsersRepository } from './users.repository';
import { EntityManager } from 'typeorm';
import { RepositoriesModule } from '@app/common';
import { OrgUserProfile } from './profiles/org-user-profile';
import { AuthModule } from '@app/auth';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		DatabaseModule,
		OrganizationModule,
		TypeOrmModule.forFeature([OrganizationUser]),
		RepositoriesModule,
		AuthModule,
		ConfigModule,
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		OrgUserProfile,
		{
			provide: UsersRepository,
			useFactory: (em: EntityManager) => new UsersRepository(em),
			inject: [EntityManager],
		},
	],
	exports: [UsersService, UsersRepository],
})
export class UsersModule {}
