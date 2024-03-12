import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { AuthModule } from '@app/auth';

@Module({
	imports: [
		DatabaseModule,
		AuthModule,
		TypeOrmModule.forFeature([
			OrganizationUser,
		]),
	],
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule {}
