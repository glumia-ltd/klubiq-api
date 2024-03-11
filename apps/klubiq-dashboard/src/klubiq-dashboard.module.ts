import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { UsersModule } from './users/users.module';

@Module({
	imports: [DatabaseModule, UsersModule],
	controllers: [],
	providers: [],
})
export class KlubiqDashboardModule {}
