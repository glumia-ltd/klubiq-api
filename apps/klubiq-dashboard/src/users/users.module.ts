import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { OrganizationRole } from './entities/organization-role.entity';
import { Feature } from './entities/feature.entity';
import { FeaturePermission } from './entities/feature-permission.entity';
import { Permission } from './entities/permission.entity';

@Module({
	imports: [
		DatabaseModule,
		TypeOrmModule.forFeature([
			OrganizationUser,
			OrganizationRole,
			Feature,
			FeaturePermission,
			Permission,
		]),
	],
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule {}
