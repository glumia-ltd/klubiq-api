import {
	Body,
	Controller,
	Delete,
	Param,
	ParseUUIDPipe,
	Post,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { NotificationSubscriptionDto } from '../dto/notification-subscription.dto';
import { AuthType } from '@app/auth/types/firebase.types';
import { Auth } from '@app/auth/decorators/auth.decorator';
import { NotificationsSubscriptionService } from '../services/notifications-subscription.service';
@ApiTags('Notifications')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Controller('notifications-subscription')
export class NotificationsSubscriptionController {
	constructor(
		private readonly configService: ConfigService,
		private readonly nsService: NotificationsSubscriptionService,
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

	@ApiOkResponse({ description: 'Subscription deleted' })
	@Delete(':id')
	async deleteNotificationSubscription(@Param('id', ParseUUIDPipe) id: string) {
		return await this.nsService.deleteSubscription(id);
	}
}
