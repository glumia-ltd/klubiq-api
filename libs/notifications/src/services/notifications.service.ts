import { ActiveUserData } from '@app/auth';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { NotificationsRepository } from '../notifications.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { forEach, transform } from 'lodash';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
// import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
//import { SNSNotificationDto } from '../dto/notification-subscription.dto';
import { NotificationsSubscriptionService } from './notifications-subscription.service';

@Injectable()
export class NotificationsService {
	//private readonly snsClient = new SNSClient({});
	private readonly logger = new Logger(NotificationsService.name);
	private currentUser: ActiveUserData;
	private notificationTopicArn: string;

	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		private readonly configService: ConfigService,
		private readonly notificationsRepository: NotificationsRepository,
		private readonly notificationsSubscriptionService: NotificationsSubscriptionService,
	) {
		// this.snsClient = new SNSClient({
		// 	region: this.configService.get<string>('AWS_S3_REGION'),
		// 	credentials: {
		// 		accessKeyId: this.configService.get<string>(
		// 			'AWS_SERVICE_USER_ACCESS_KEY_ID',
		// 		),
		// 		secretAccessKey: this.configService.get<string>(
		// 			'AWS_SERVICE_USER_SECRET_ACCESS_KEY',
		// 		),
		// 	},
		// });
		// this.notificationTopicArn = this.configService.get<string>(
		// 	'SNS_NOTIFICATION_TOPIC_ARN',
		// );
	}

	async createNotifications(createNotificationsDto: CreateNotificationDto[]) {
		const Notifications = this.notificationsRepository.create(
			createNotificationsDto,
		);
		const notifications =
			await this.notificationsRepository.save(Notifications);
		const notificationIds: string[] = transform(
			notifications,
			(result, item) => {
				result.push(item.id);
			},
			[],
		);
		return notificationIds;
	}

	async getUserNotifications(userId: string, isRead?: boolean) {
		const query = this.notificationsRepository
			.createQueryBuilder('notifications')
			.where('notifications.userId = :userId', { userId });
		if (isRead) {
			query.andWhere('notifications.isRead = :isRead', { isRead });
		}
		return query.orderBy('notifications.createdAt', 'DESC').getMany();
	}

	async markAsReadOrDelivered(
		ids: string[],
		delivered?: boolean,
		read?: boolean,
	) {
		forEach(ids, (id) => {
			this.notificationsRepository.update(id, {
				isRead: read,
				isDelivered: delivered,
				readAt: read ? DateTime.utc().toJSDate() : null,
				deliveredAt: delivered ? DateTime.utc().toJSDate() : null,
			});
		});
	}

	async deleteNotifications(ids: string[]) {
		return this.notificationsRepository.delete(ids);
	}

	// async publishNotification(data: SNSNotificationDto) {
	// 	console.log('PUBLISHING NOTIFICATION: ', data);
	// 	const params = {
	// 		TopicArn: this.notificationTopicArn,
	// 		Message: JSON.stringify(data),
	// 		MessageAttributes: {
	// 			type: {
	// 				DataType: 'String',
	// 				StringValue: data.type,
	// 			},
	// 		},
	// 	};
	// 	console.log('PARAMS: ', params);
	// 	const published = await this.snsClient.send(new PublishCommand(params));
	// 	console.log('published output: ', published);
	// }
}
