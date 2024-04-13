import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { Role } from './entities/role.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Permission } from './entities/permission.entity';
import { OrganizationRole } from './entities/organization-role.entity';
import { Feature } from './entities/feature.entity';
import { FeaturePermission } from './entities/feature-permission.entity';
import { PropertyType } from './entities/property-type.entity';
import { PropertyCategory } from './entities/property-category.entity';
import { PropertyPurpose } from './entities/property-purpose.entity';
import { PropertyStatus } from './entities/property-status.entity';

/// WE HAVE 2 SCHEMA TYPES. => KDO and POO
/// KDO = Klubiq Data Object
/// POO = Property Owner Object
@Module({
	imports: [
		TypeOrmModule.forFeature([
			Role,
			UserProfile,
			Permission,
			OrganizationRole,
			Feature,
			FeaturePermission,
			PropertyType,
			PropertyCategory,
			PropertyPurpose,
			PropertyStatus,
		]),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
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
})
export class DatabaseModule {}
