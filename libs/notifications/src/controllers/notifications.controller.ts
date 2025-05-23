import {
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiCreatedResponse,
	ApiExcludeEndpoint,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { AuthType } from '@app/auth/types/firebase.types';
import { Auth } from '@app/auth/decorators/auth.decorator';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { SendNotificationDto } from '../dto/notification-subscription.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Auth(AuthType.None)
	@ApiExcludeEndpoint()
	@ApiCreatedResponse({ description: 'Creates a new  notification' })
	@ApiBody({ type: [CreateNotificationDto] })
	@Post()
	async createNotification(
		@Body() createNotificationDtos: CreateNotificationDto[],
	) {
		return await this.notificationsService.createNotifications(
			createNotificationDtos,
		);
	}

	@Auth(AuthType.Bearer)
	@ApiOkResponse({ description: 'Get user notifications' })
	@Get()
	async getNotifications(
		@Query('userId') userId: string,
		@Query('isRead') isRead?: boolean,
	) {
		return await this.notificationsService.getUserNotifications(userId, isRead);
	}

	@Auth(AuthType.None)
	@ApiExcludeEndpoint()
	@ApiOkResponse({ description: 'Mark notifications as read' })
	@ApiBody({ description: 'Mark notifications as read', type: [String] })
	@Patch('mark-as-read-or-delivered')
	async markNotificationsAsReadOrDelivered(
		@Body()
		readOrDelivered: {
			notificationIds: string[];
			isRead: boolean;
			isDelivered: boolean;
		},
	) {
		return await this.notificationsService.markAsReadOrDelivered(
			readOrDelivered.notificationIds,
			readOrDelivered.isDelivered,
			readOrDelivered.isRead,
		);
	}

	@Auth(AuthType.None)
	@ApiExcludeEndpoint()
	@ApiOkResponse({ description: 'Delete notifications' })
	@ApiBody({ description: 'Delete notifications', type: [String] })
	@Delete('delete')
	async deleteNotifications(@Body() notificationIds: string[]) {
		return await this.notificationsService.deleteNotifications(notificationIds);
	}

	@Auth(AuthType.None)
	@ApiExcludeEndpoint()
	@ApiOkResponse({ description: 'Web push notification sent' })
	@Post('send-web-notification')
	async sendWebNotification(@Body() notificationDto: SendNotificationDto) {
		return await this.notificationsService.sendWebPushNotification(
			notificationDto,
		);
	}

	@Auth(AuthType.Bearer)
	@ApiExcludeEndpoint()
	@ApiOkResponse({ description: 'Get unread notifications count' })
	@Get('count')
	async getUnreadNotificationsCount(@Query('userId') userId: string) {
		return await this.notificationsService.getUnreadNotificationsCount(userId);
	}
}
