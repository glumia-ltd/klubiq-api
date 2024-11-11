import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PropertyEvent } from '../event-models/property-event';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { each, transform } from 'lodash';
import { CacheKeys } from '@app/common/config/config.constants';
import { UsersService } from 'apps/klubiq-dashboard/src/users/services/users.service';
import { ConfigService } from '@nestjs/config';
import { CreateNotificationDto } from '@app/notifications/dto/create-notification.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { EmailTypes } from '@app/common/email/types/email.types';
import {
	EVENT_TEMPLATE,
	EVENTS,
	EventTemplate,
} from '../event-models/event-constants';
import { NotificationsService } from '@app/notifications/services/notifications.service';
import { NotificationPayloadDto } from '@app/notifications/dto/notification-subscription.dto';

@Injectable()
export class PropertyEventsListener {
	private readonly orgAdminRoleId: number;
	private readonly supportEmail: string;
	private readonly clientBaseUrl: string;
	private readonly emailCopyrightText: string;
	private readonly logger = new Logger(PropertyEventsListener.name);
	constructor(
		private readonly userService: UsersService,
		private readonly configService: ConfigService,
		private readonly notificationService: NotificationsService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		@InjectQueue('notification') private notificationQueue: Queue,
	) {
		this.orgAdminRoleId = this.configService.get<number>('ORG_OWNER_ROLE_ID');
		this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
		this.clientBaseUrl = this.configService.get<string>('CLIENT_BASE_URL');
		this.emailCopyrightText = this.configService.get<string>(
			'EMAIL_COPYRIGHT_TEXT',
		);
	}
	@OnEvent(EVENTS.PROPERTY_CREATED, { async: true })
	async handlePropertyCreatedEvent(payload: PropertyEvent) {
		await this.invalidateOrganizationPropertyCache(payload);
		await this.createEmailNotification(payload);
	}

	@OnEvent('property.updated')
	@OnEvent('property.deleted')
	@OnEvent('property.archived')
	async handlePropertyUpdatedOrDeletedEvent(payload: PropertyEvent) {
		console.log('ABOUT TO invalidateOrganizationPropertyCache', payload);
		await this.invalidateOrganizationPropertyCache(payload);
	}

	private async invalidateOrganizationPropertyCache(payload: PropertyEvent) {
		const propertyCacheKeys = this.getPropertyRelatedCacheKeys(
			payload.organizationId,
		);
		each(propertyCacheKeys, async (key) => {
			const cacheData = await this.cacheManager.get(key);
			if (cacheData && key.includes('getPropertyListKeys')) {
				this.deletePropertyFilteredCacheKeys(cacheData as string[]);
			} else {
				await this.cacheManager.del(key);
			}
		});
	}
	private deletePropertyFilteredCacheKeys(keys: string[]) {
		each(keys, async (key) => {
			await this.cacheManager.del(key);
		});
	}

	private getPropertyRelatedCacheKeys(organizationId: string) {
		return [
			`${organizationId}/getPropertyListKeys`,
			`dashboard/${CacheKeys.PROPERTY_METRICS}/${organizationId}`,
			`properties-grouped-units/${organizationId}`,
		];
	}

	private async getNotificationRecipients(
		payload: PropertyEvent,
		template: EventTemplate,
	) {
		const {
			organizationId,
			propertyManagerEmail,
			propertyManagerName,
			propertyManagerId,
		} = payload;
		const users = await this.userService.getOrgUsersByRoleId(
			this.orgAdminRoleId,
			organizationId,
		);
		this.logger.log('Users to Notify: ', users);
		const notificationRecipients = transform(
			users,
			(result, user) => {
				result.userIds.push(user.userId);
				result.emailRecipients.push({
					email: user.email,
					firstName: user.firstName,
				});
				result.notificationDtos.push({
					userId: user.userId,
					title: template.subject,
					message: template.message,
					type: template.type,
					propertyId: payload.propertyId,
					organizationUuid: payload.organizationId,
				});
			},
			{ userIds: [], emailRecipients: [], notificationDtos: [] },
		);
		if (!notificationRecipients.userIds.includes(propertyManagerId)) {
			notificationRecipients.userIds.push(propertyManagerId);
			notificationRecipients.emailRecipients.push({
				email: propertyManagerEmail,
				firstName: propertyManagerName,
			});
			notificationRecipients.notificationDtos.push({
				userId: propertyManagerId,
				title: template.subject,
				message: template.message,
				type: template.type,
				propertyId: payload.propertyId,
				organizationUuid: payload.organizationId,
			});
		}
		return notificationRecipients;
	}

	// private async createAndSendPropertyNotification(payload: PropertyEvent) {
	// 	const template = this.getPropertyCreatedNotificationTemplate(payload);
	// 	const notificationRecipients = await this.getNotificationRecipients(
	// 		payload,
	// 		template,
	// 	);
	// 	// const snsNotification: SNSNotificationDto = {
	// 	// 	subject: template.subject,
	// 	// 	message: template.message,
	// 	// 	userIds: notificationRecipients.userIds,
	// 	// 	emails: notificationRecipients.userEmails,
	// 	// 	userNames: notificationRecipients.userNames,
	// 	// 	type: template.type,
	// 	// 	channels: ['EMAIL', 'PUSH'],
	// 	// 	emailTemplateId: template.emailTemplateId,
	// 	// };
	// 	const notification: CreateNotificationDto[] =
	// 		notificationRecipients.notificationDtos;
	// 	await this.notificationService.createNotifications(notification);
	// 	// snsNotification.notificationIds = notificationIds;
	// 	// await this.notificationService.publishNotification(snsNotification);
	// }

	private async createEmailNotification(payload: PropertyEvent) {
		const template = EVENT_TEMPLATE(payload)[EVENTS.PROPERTY_CREATED];
		const notificationRecipients = await this.getNotificationRecipients(
			payload,
			template,
		);
		const notification: CreateNotificationDto[] =
			notificationRecipients.notificationDtos;
		const notificationIds =
			await this.notificationService.createNotifications(notification);
		const personalization = {
			property_name: payload.name,
			property_address: payload.propertyAddress,
			unit_count: payload.totalUnits,
			support_email: this.supportEmail,
			view_property_link: `${this.clientBaseUrl}/properties/${payload.propertyId}`,
			copyright: this.emailCopyrightText,
		};
		const data = {
			emailTemplate: EmailTypes.PROPERTY_CREATED,
			notificationIds,
			recipients: notificationRecipients.emailRecipients,
			personalization,
			userIds: notificationRecipients.userIds,
			channels: ['EMAIL', 'PUSH'],
			notificationData: {
				title: template.subject,
				body: template.message,
				data: {
					propertyId: payload.propertyId,
					organizationUuid: payload.organizationId,
				},
				actionLink: `${this.clientBaseUrl}/properties/${payload.propertyId}`,
			} as NotificationPayloadDto,
		};
		await this.notificationQueue.add('notify', data, {
			lifo: false,
			removeOnComplete: true,
			removeOnFail: true,
		});
	}
}
