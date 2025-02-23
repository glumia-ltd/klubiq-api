import { Module } from '@nestjs/common/decorators/modules';
import { ConfigModule } from '../config/config.module';
import { UserProfile } from './entities/user-profile.entity';
import { Permission } from './entities/permission.entity';
import { OrganizationRole } from './entities/organization-role.entity';
import { Feature } from './entities/feature.entity';
import { FeaturePermission } from './entities/feature-permission.entity';
import { Lease } from './entities/lease.entity';
import { Transaction } from './entities/transaction.entity';
import { Maintenance } from './entities/maintenance.entity';
import { OrganizationSubscriptions } from './entities/organization-subscriptions.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { OrganizationCounter } from './entities/organization-counter.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { OrganizationUser } from './entities/organization-user.entity';
import { Organization } from './entities/organization.entity';
import { Unit } from './entities/unit.entity';
import { Property } from './entities/property.entity';
import { PropertyAddress } from './entities/property-address.entity';
import { NotificationSubscription } from './entities/notification-subscription.entity';
import { Notifications } from './entities/notifications.entity';
import { RoleFeaturePermissions } from './entities/role-feature-permission.entity';
import { MainSeeder } from './seeder';
import { Logger, OnApplicationBootstrap } from '@nestjs/common';

/// WE HAVE 2 SCHEMA TYPES. => KDO and POO
/// KDO = Klubiq Data Object
/// POO = Property Owner Object
@Module({
	imports: [
		TypeOrmModule.forFeature([
			UserProfile,
			Permission,
			Feature,
			FeaturePermission,
			OrganizationRole,
			Lease,
			Maintenance,
			Transaction,
			SubscriptionPlan,
			OrganizationSubscriptions,
			OrganizationCounter,
			OrganizationUser,
			Organization,
			Unit,
			Property,
			PropertyAddress,
			NotificationSubscription,
			Notifications,
			RoleFeaturePermissions,
		]),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				timezone: 'UTC',
				host: configService.get<string>('DATABASE_HOST'),
				port: configService.get<number>('DATABASE_PORT'),
				username: configService.get<string>('DATABASE_USERNAME'),
				password: configService.get<string>('DATABASE_PASSWORD'),
				database: configService.get<string>('DATABASE_NAME'),
				autoLoadEntities: true,
				ssl: !configService.get<boolean>('SYNCHRONIZE_DB')
					? {
							rejectUnauthorized: false,
						}
					: false,
				synchronize: configService.get<boolean>('SYNCHRONIZE_DB'),
			}),
			inject: [ConfigService],
		}),
	],
	providers: [MainSeeder],
})
export class DatabaseModule implements OnApplicationBootstrap {
	private readonly logger = new Logger(DatabaseModule.name);
	constructor(
		private readonly mainSeeder: MainSeeder,
		private readonly configService: ConfigService,
	) {}

	async onApplicationBootstrap() {
		const seedDatabase = this.configService.get<boolean>('SYNCHRONIZE_DB');
		if (seedDatabase) {
			this.logger.log('Seeding database...');
			await this.mainSeeder.run();
			this.logger.log('Database seeded.');
		} else {
			this.logger.log('Database seeding is disabled.');
		}
	}
}
