import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common/database/database.module';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { PermissionsModule } from '@app/common/permissions/permissions.module';
import { HealthModule } from '@app/common/health/health.module';
import { ConfigModule } from '@app/common/config/config.module';
import { PublicModule } from '@app/common/public/public.module';
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
import { SubscriptionModule } from '@app/common/public/subscription/subscription.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
	imports: [
		// Common modules
		EventEmitterModule.forRoot(),

		// CUSTOM MODULES
		AuthModule,
		ConfigModule,
		DashboardModule,
		DatabaseModule,
		HealthModule,
		LeaseModule,
		OrganizationModule,
		PermissionsModule,
		PropertiesModule,
		PublicModule,
		RepositoriesModule,
		SubscriptionModule,
		UsersModule,
	],
	providers: [
		ApikeyGuard,
		AuthenticationGuard,
		FirebaseAuthGuard,
		LeaseRepository,
		PermissionsGuard,
		RolesGuard,
		UsersRepository,
		UsersService,
		{
			provide: APP_GUARD,
			useClass: AuthenticationGuard,
		},
		{
			provide: APP_GUARD,
			useClass: PermissionsGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
	exports: [UsersModule],
})
export class KlubiqDashboardModule {}
