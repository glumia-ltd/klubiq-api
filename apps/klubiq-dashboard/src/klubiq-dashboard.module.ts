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
import { SSEAuthGuard } from '@app/auth/guards/sse-auth.guard';
import { CacheService } from '@app/common/services/cache.service';
import { TransactionsModule } from './transactions/transactions.module';
import { NotificationsModule } from '@app/notifications/notifications.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { EventListenerModule } from '@app/common/event-listeners/event-listener.module';
import { KdoDBSchemaModule } from '@app/common/database/kdo-db-schema.module';

@Module({
	imports: [
		DevtoolsModule.registerAsync({
			useFactory: () => ({
				http: process.env.NODE_ENV !== 'production',
			}),
		}),
		// Common modules
		EventEmitterModule.forRoot(),

		// CUSTOM MODULES
		AuthModule,
		ConfigModule,
		DashboardModule,
		DatabaseModule,
		KdoDBSchemaModule,
		HealthModule,
		LeaseModule,
		OrganizationModule,
		PermissionsModule,
		PropertiesModule,
		PublicModule,
		RepositoriesModule,
		SubscriptionModule,
		UsersModule,
		TransactionsModule,
		NotificationsModule,
		EventListenerModule,
	],
	providers: [
		ApikeyGuard,
		FirebaseAuthGuard,
		SSEAuthGuard,
		LeaseRepository,
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
		{
			provide: CacheService,
			useFactory: () => new CacheService(null),
		},
	],
	//exports: [UsersModule],
})
export class KlubiqDashboardModule {}
