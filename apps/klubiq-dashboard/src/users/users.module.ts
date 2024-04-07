import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { UsersRepository } from './users.repository';
import { EntityManager } from 'typeorm';
import { RepositoriesModule } from '@app/common';
import { OrgUserMapProfile } from './profiles/org-user-profile';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@app/auth';

@Module({
	imports: [
		DatabaseModule,
		TypeOrmModule.forFeature([OrganizationUser]),
		RepositoriesModule,
		ConfigModule,
		AuthModule,
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		OrgUserMapProfile,
		{
			provide: UsersRepository,
			useFactory: (em: EntityManager) => new UsersRepository(em),
			inject: [EntityManager],
		},
	],
	exports: [UsersService, UsersRepository],
})
export class UsersModule {}
