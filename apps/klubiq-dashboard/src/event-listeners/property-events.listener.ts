import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PropertyEvent } from './event-models/property-event';
import { DashboardService } from '../dashboard/services/dashboard.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { each, transform } from 'lodash';
import { CacheKeys } from '@app/common/config/config.constants';
import { UsersService } from '../users/services/users.service';
import { ConfigService } from '@nestjs/config';
import { SNSNotificationDto } from '@app/notifications/dto/notification-subscription.dto';
import { CreateNotificationDto } from '@app/notifications/dto/create-notification.dto';

import { NotificationsService } from '@app/notifications';

@Injectable()
export class PropertyCreatedListener {
	private readonly orgAdminRoleId: number;
	constructor(
		private readonly dashboardService: DashboardService,
		private readonly userService: UsersService,
		private readonly configService: ConfigService,
		private readonly notificationService: NotificationsService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {
		this.orgAdminRoleId = this.configService.get<number>('ORG_OWNER_ROLE_ID');
	}
	@OnEvent('property.created')
	async handlePropertyCreatedEvent(payload: PropertyEvent) {
		await this.invalidateOrganizationPropertyCache(payload);
		//await this.createAndSendPropertyNotification(payload);
	}

	@OnEvent('property.updated')
	@OnEvent('property.deleted')
	@OnEvent('property.archived')
	async handlePropertyUpdatedOrDeletedEvent(payload: PropertyEvent) {
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
		template: any,
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
		console.log('Users to Notify: ', users);
		const notificationRecipients = transform(
			users,
			(result, user) => {
				result.userIds.push(user.userId);
				result.userEmails.push(user.email);
				result.userNames.push(user.firstName);
				result.notificationDtos.push({
					userId: user.userId,
					title: template.subject,
					message: template.message,
					type: template.type,
					propertyId: payload.propertyId,
					organizationUuid: payload.organizationId,
				});
			},
			{ userIds: [], userEmails: [], userNames: [], notificationDtos: [] },
		);
		if (!notificationRecipients.userIds.includes(propertyManagerId)) {
			notificationRecipients.userIds.push(propertyManagerId);
			notificationRecipients.userEmails.push(propertyManagerEmail);
			notificationRecipients.userNames.push(propertyManagerName);
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

	private async createAndSendPropertyNotification(payload: PropertyEvent) {
		const template = this.getPropertyCreatedNotificationTemplate(payload);
		const notificationRecipients = await this.getNotificationRecipients(
			payload,
			template,
		);
		const snsNotification: SNSNotificationDto = {
			subject: template.subject,
			message: template.message,
			userIds: notificationRecipients.userIds,
			emails: notificationRecipients.userEmails,
			userNames: notificationRecipients.userNames,
			type: template.type,
			channels: ['EMAIL', 'PUSH'],
			emailTemplateId: template.emailTemplateId,
		};
		const notification: CreateNotificationDto[] =
			notificationRecipients.notificationDtos;
		const notificationIds =
			await this.notificationService.createNotifications(notification);
		snsNotification.notificationIds = notificationIds;
		await this.notificationService.publishNotification(snsNotification);
	}

	private getPropertyCreatedNotificationTemplate(payload: PropertyEvent) {
		return {
			subject: 'New Property Created',
			message: `A new property has been created by ${payload.propertyManagerName} in your organization.`,
			emailTemplateId: 'property-created',
			type: 'PROPERTY_CREATED',
		};
	}
}
