import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { AuthModule }   from '@app/auth';
import { UsersModule } from './users/users.module';

@Module({
	imports: [DatabaseModule, UsersModule, AuthModule],
	controllers: [],
	providers: [],
})
export class KlubiqDashboardModule {}
