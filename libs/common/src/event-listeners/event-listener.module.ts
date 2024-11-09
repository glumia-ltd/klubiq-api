import { Module } from '@nestjs/common';
import { NotificationQueueListener } from './services/notification-queue.listener';
import { PropertyEventsListener } from './services/property-events.listener';
import { QueueModule } from '../config/queue.module';
import { UsersModule } from 'apps/klubiq-dashboard/src/users/users.module';
import { NotificationsModule } from '@app/notifications';

@Module({
	imports: [QueueModule, UsersModule, NotificationsModule],
	providers: [PropertyEventsListener, NotificationQueueListener],
})
export class EventListenerModule {}
