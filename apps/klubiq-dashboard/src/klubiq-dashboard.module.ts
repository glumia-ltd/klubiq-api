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
import { UsersService } from './users/services/users.service';
import { UsersRepository } from './users/repositories/users.repository';
import { APP_GUARD } from '@nestjs/core';
import { PropertiesModule } from './properties/properties.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PermissionsGuard } from '@app/auth/guards/permissions.guard';
import { LeaseModule } from './lease/lease.module';
import { LeaseRepository } from './lease/repositories/lease.repository';

@Module({
	imports: [
		DatabaseModule,
		ConfigModule,
		AuthModule,
		DashboardModule,
		HealthModule,
		OrganizationModule,
		PermissionsModule,
		PropertiesModule,
		PublicModule,
		UsersModule,
		LeaseModule,
	],
	providers: [
		UsersService,
		UsersRepository,
		UserProfilesRepository,
		RolesRepository,
		LeaseRepository,
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
		{
			provide: APP_GUARD,
			useClass: PermissionsGuard,
		},
	],
	exports: [UsersModule],
})
export class KlubiqDashboardModule {}
