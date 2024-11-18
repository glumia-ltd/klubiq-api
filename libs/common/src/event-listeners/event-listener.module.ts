import { Module } from '@nestjs/common';
import { NotificationQueueListener } from './services/notification-queue.listener';
import { PropertyEventsListener } from './services/property-events.listener';
import { QueueModule } from '../config/queue.module';
import { UsersModule } from 'apps/klubiq-dashboard/src/users/users.module';
import { NotificationsModule } from '@app/notifications';
import { HelperService } from './services/listeners-helper';

@Module({
	imports: [QueueModule, UsersModule, NotificationsModule],
	providers: [PropertyEventsListener, NotificationQueueListener, HelperService],
})
export class EventListenerModule {}
