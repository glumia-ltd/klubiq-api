import { Module } from '@nestjs/common';
import {
	DatabaseModule,
	RolesRepository,
	UserProfilesRepository,
} from '@app/common';
import { AuthModule } from '@app/auth';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { AuthController } from './auth/auth.controller';
import { HealthModule } from './health/health.module';

@Module({
	imports: [
		DatabaseModule,
		UsersModule,
		AuthModule,
		OrganizationModule,
		HealthModule,
	],
	controllers: [AuthController],
	providers: [
		UsersService,
		UsersRepository,
		UserProfilesRepository,
		RolesRepository,
	],
	exports: [UsersModule],
})
export class KlubiqDashboardModule {}
