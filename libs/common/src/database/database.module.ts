import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { Role } from './entities/role.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Permission } from './entities/permission.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Role, UserProfile, Permission]),
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
				synchronize: configService.get<boolean>('SYNCHRONIZE_DB'),
				migrations: ['**/migrations']
			}),
			inject: [ConfigService],
		}),
	],
})
export class DatabaseModule {}
