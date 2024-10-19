import { Module } from '@nestjs/common';
import { NotificationsSubscriptionService } from './services/notifications-subscription.service';
import { ConfigService } from '@nestjs/config';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import {
	NotificationsRepository,
	NotificationsSubscriptionRepository,
} from './notifications.repository';
import { NotificationsSubscriptionController } from './controllers/notifications-subscriptions.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';

@Module({
	imports: [RepositoriesModule],
	controllers: [NotificationsSubscriptionController, NotificationsController],
	providers: [
		NotificationsSubscriptionService,
		ConfigService,
		NotificationsRepository,
		NotificationsSubscriptionRepository,
		NotificationsService,
	],
	exports: [NotificationsSubscriptionService],
})
export class NotificationsModule {}
