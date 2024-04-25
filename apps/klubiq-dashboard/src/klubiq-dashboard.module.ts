import { Module } from '@nestjs/common';
import {
	DatabaseModule,
	RolesRepository,
	UserProfilesRepository,
	PermissionsModule,
	HealthModule,
	ConfigModule,
	PublicModule,
} from '@app/common';
import {
	ApikeyGuard,
	AuthenticationGuard,
	AuthModule,
	FirebaseAuthGuard,
	RolesGuard,
} from '@app/auth';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { APP_GUARD } from '@nestjs/core';
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
		PublicModule,
	],
	providers: [
		UsersService,
		UsersRepository,
		UserProfilesRepository,
		RolesRepository,
		FirebaseAuthGuard,
		ApikeyGuard,
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
