import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import {
	NotificationDto,
	NotificationSubscriptionDto,
} from './dto/notification-subscription.dto';
import { AuthType } from '@app/auth/types/firebase.types';
import { Auth } from '@app/auth/decorators/auth.decorator';
import { NotificationsService } from './notifications.service';
import { PushSubscription } from './dto/notification-subscription.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Controller('notifications')
export class NotificationsController {
	constructor(
		private readonly configService: ConfigService,
		private readonly nsService: NotificationsService,
	) {
		webpush.setVapidDetails(
			`mailto:${configService.get<string>('SUPPORT_EMAIL')}`,
			configService.get<string>('WEB_VAPID_PUSH_PUBLIC_KEY'),
			configService.get<string>('WEB_VAPID_PUSH_PRIVATE_KEY'),
		);
	}

	@ApiCreatedResponse({ description: 'Subscription successful' })
	@Post('subscribe')
	async subscribe(@Body() subscription: NotificationSubscriptionDto) {
		// Save subscription to database
		// ...
		const subscribeResult =
			await this.nsService.createOrUpdateNotificationSubscription(subscription);
		return subscribeResult;
	}

	@Post('send')
	async sendNotificationToUsers(@Body() notification: NotificationDto) {
		try {
			const subscriptions = await this.nsService.getUserSubscriptionDetails(
				notification.userEmails,
			);
			const promises = subscriptions.map((item) => {
				return webpush.sendNotification(
					item.subscription['web'] as PushSubscription,
					JSON.stringify(notification.data),
				);
			});
			await Promise.all(promises);
		} catch (error) {
			console.error(`Error sending notification: ${error}`);
		}
		return { message: 'Notification sent successfully' };
	}
}
