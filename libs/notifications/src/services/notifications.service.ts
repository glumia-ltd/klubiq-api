import { ActiveUserData } from '@app/auth';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { NotificationsRepository } from '../notifications.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { each, forEach, transform } from 'lodash';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
// import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
//import { SNSNotificationDto } from '../dto/notification-subscription.dto';
import { NotificationsSubscriptionService } from './notifications-subscription.service';
import * as webpush from 'web-push';
import {
	groupedNotification,
	NotificationsDto,
	SendNotificationDto,
} from '../dto/notification-subscription.dto';
import { NotificationPeriod } from '@app/common/config/config.constants';

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
		webpush.setVapidDetails(
			`mailto:${this.configService.get<string>('SUPPORT_EMAIL')}`,
			this.configService.get<string>('WEB_VAPID_PUSH_PUBLIC_KEY'),
			this.configService.get<string>('WEB_VAPID_PUSH_PRIVATE_KEY'),
		);
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

	async getUnreadNotificationsCount(userId: string, days: number = 14) {
		if (!userId) {
			this.currentUser = this.cls.get('currentUser');
			userId = this.currentUser.kUid;
		}
		const dateMin = DateTime.utc().minus({ days }).toJSDate();
		const dateMax = DateTime.utc().toJSDate();
		return await this.notificationsRepository
			.createQueryBuilder('notifications')
			.where('notifications.userId = :userId', { userId })
			.andWhere('notifications.createdAt >= :dateMin', {
				dateMin: dateMin,
			})
			.andWhere('notifications.createdAt <= :dateMax', {
				dateMax: dateMax,
			})
			.andWhere(
				'(notifications.expiresAt IS NULL OR notifications.expiresAt >= :currentDate)',
				{
					currentDate: dateMax,
				},
			)
			.andWhere('notifications.isRead = :isRead', { isRead: false })
			.getCount();
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

	async getUserNotifications(
		userId?: string,
		isRead: boolean = false,
		days: number = 14,
	) {
		if (!userId) {
			this.currentUser = this.cls.get('currentUser');
			userId = this.currentUser.kUid;
		}
		const query = this.notificationsRepository
			.createQueryBuilder('notifications')
			.where('notifications.userId = :userId', { userId })
			.andWhere('notifications.createdAt >= :date', {
				date: DateTime.utc().minus({ days }).toJSDate(),
			})
			.orWhere('notifications.isAnnouncement = :isAnnouncement', {
				isAnnouncement: true,
			})
			.andWhere('notifications.expiresAt >= :currentDate', {
				currentDate: DateTime.utc().toJSDate(),
			});
		if (isRead) {
			query.andWhere('notifications.isRead = :isRead', { isRead });
		}
		return await query.orderBy('notifications.createdAt', 'DESC').getMany();
		// const data = this.groupNotificationsByDate(notifications)
		// return data;
	}

	private groupNotificationsByDate(
		notifications: NotificationsDto[],
	): groupedNotification[] {
		const today = DateTime.utc().startOf('day');
		const yesterday = today.minus({ days: 1 });
		const last7Days = today.minus({ days: 7 });
		const last30Days = today.minus({ days: 30 });
		const grouped = {
			today: [],
			yesterday: [],
			last7Days: [],
			last30Days: [],
			older: [],
		};
		const groupedNotifications: groupedNotification[] = [];
		each(notifications, (notification) => {
			const createdAt = DateTime.fromJSDate(notification.createdAt);
			const timeDiff = today
				.diff(createdAt, ['days', 'hours', 'minutes'])
				.toObject();
			notification.time = this.formatTimeDiff(timeDiff);
			if (createdAt >= today) {
				grouped.today.push(notification);
			} else if (createdAt >= yesterday) {
				grouped.yesterday.push(notification);
			} else if (createdAt >= last7Days) {
				grouped.last7Days.push(notification);
			} else if (createdAt >= last30Days) {
				grouped.last30Days.push(notification);
			} else {
				grouped.older.push(notification);
			}
		});
		if (grouped.today.length > 0) {
			groupedNotifications.push({
				period: NotificationPeriod.Today,
				notifications: grouped.today,
			});
		}
		if (grouped.yesterday.length > 0) {
			groupedNotifications.push({
				period: NotificationPeriod.Yesterday,
				notifications: grouped.yesterday,
			});
		}
		if (grouped.last7Days.length > 0) {
			groupedNotifications.push({
				period: NotificationPeriod.Last7Days,
				notifications: grouped.last7Days,
			});
		}
		if (grouped.last30Days.length > 0) {
			groupedNotifications.push({
				period: NotificationPeriod.Last30Days,
				notifications: grouped.last30Days,
			});
		}
		if (grouped.older.length > 0) {
			groupedNotifications.push({
				period: NotificationPeriod.Older,
				notifications: grouped.older,
			});
		}
		if (grouped.older.length > 0) {
			groupedNotifications.push({
				period: NotificationPeriod.Older,
				notifications: grouped.older,
			});
		}
		return groupedNotifications;
	}

	private formatTimeDiff(timeDiff: any) {
		const days = Math.floor(timeDiff.days);
		const hours = Math.floor(timeDiff.hours);
		const minutes = Math.floor(timeDiff.minutes);
		if (days > 0) {
			return `${days}d`;
		} else if (hours > 0) {
			return `${hours}h`;
		} else {
			return `${minutes}m`;
		}
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
	// 	//console.log('PUBLISHING NOTIFICATION: ', data);
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
	// 	//console.log('PARAMS: ', params);
	// 	const published = await this.snsClient.send(new PublishCommand(params));
	// 	//console.log('published output: ', published);
	// }

	async sendWebPushNotification(notification: SendNotificationDto) {
		try {
			const subscriptions =
				await this.notificationsSubscriptionService.getUserSubscriptionDetails(
					notification.userIds,
				);
			const promises = subscriptions.map((item) => {
				const subscription = item.subscription['web-push'] as PushSubscription;
				return webpush
					.sendNotification(subscription, JSON.stringify(notification.payload))
					.catch((error: any) => {
						this.logger.error(error);
					});
			});
			await Promise.all(promises);
		} catch (error) {
			//console.log('ERROR SENDING PUSH NOTIFICATION: ', error);
			this.logger.error(error);
		}
	}
}
