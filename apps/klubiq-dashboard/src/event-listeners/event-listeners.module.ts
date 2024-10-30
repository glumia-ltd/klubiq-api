import { Module } from '@nestjs/common';
import { PropertyCreatedListener } from './property-events.listener';
import { DashboardModule } from '../dashboard/dashboard.module';
import { EventsController } from './events.controller';
import { UsersModule } from '../users/users.module';
import { ConfigService } from '@nestjs/config';
import { NotificationsModule } from '@app/notifications/notifications.module';

@Module({
	imports: [DashboardModule, UsersModule, NotificationsModule],
	providers: [PropertyCreatedListener, ConfigService],
	controllers: [EventsController],
})
export class EventListenersModule {}
