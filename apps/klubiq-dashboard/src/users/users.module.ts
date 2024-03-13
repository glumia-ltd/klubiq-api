import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { OrganizationModule } from '../organization/organization.module';
import { AuthModule } from '@app/auth';
import { UsersRepository } from './users.repository';
import { EntityManager } from 'typeorm';
import { RepositoriesModule } from '@app/common';

@Module({
	imports: [
		DatabaseModule,
		AuthModule,
		OrganizationModule,
		TypeOrmModule.forFeature([OrganizationUser]),
		RepositoriesModule,
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		{
			provide: UsersRepository,
			useFactory: (em: EntityManager) => new UsersRepository(em),
			inject: [EntityManager],
		},
	],
})
export class UsersModule {}
