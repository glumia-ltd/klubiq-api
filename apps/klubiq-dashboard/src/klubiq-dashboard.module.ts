import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
	DatabaseModule,
	RolesRepository,
	UserProfilesRepository,
	PermissionsModule,
	HealthModule,
	ConfigModule,
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
import { PublicController } from './public/public.controller';
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
		ClientsModule.registerAsync([
			{
				name: 'KLUBIQ_SERVICE',
				useFactory: () => ({
					transport: Transport.REDIS,
					options: {
						host: 'localhost',
						port: 6379,
					},
				}),
			},
		]),
	],
	controllers: [PublicController],
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
