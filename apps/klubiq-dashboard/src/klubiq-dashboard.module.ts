import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { AuthModule } from '@app/auth';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
	imports: [DatabaseModule, UsersModule, AuthModule, OrganizationModule],
	controllers: [],
	providers: [],
})
export class KlubiqDashboardModule {}
