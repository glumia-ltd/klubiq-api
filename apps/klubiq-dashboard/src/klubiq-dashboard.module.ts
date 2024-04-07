import { Module } from '@nestjs/common';
import {
	DatabaseModule,
	RolesRepository,
	UserProfilesRepository,
	PermissionsModule,
} from '@app/common';
import {
	AuthenticationGuard,
	AuthModule,
	FirebaseAuthGuard,
	RolesGuard,
} from '@app/auth';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { AuthController } from './auth/auth.controller';
import { HealthModule } from './health/health.module';
import { PublicController } from './public/public.controller';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@app/common';
import { PropertiesModule } from './properties/properties.module';

@Module({
	imports: [
		DatabaseModule,
		UsersModule,
		AuthModule,
		OrganizationModule,
		HealthModule,
		PermissionsModule,
		ConfigModule,
		PropertiesModule,
	],
	controllers: [AuthController, PublicController],
	providers: [
		UsersService,
		UsersRepository,
		UserProfilesRepository,
		RolesRepository,
		FirebaseAuthGuard,
		{
			provide: APP_GUARD,
			useClass: AuthenticationGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
	exports: [UsersModule],
})
export class KlubiqDashboardModule {}
