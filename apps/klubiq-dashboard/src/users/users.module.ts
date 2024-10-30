import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { DatabaseModule } from '@app/common/database/database.module';
import { UsersRepository } from './repositories/users.repository';
import { EntityManager } from 'typeorm';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { OrgUserMapProfile } from './profiles/org-user-profile';
import { AuthModule } from '@app/auth';

@Module({
	imports: [DatabaseModule, RepositoriesModule, AuthModule],
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
