import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PropertyEvent } from './event-models/property-event';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { each, map, transform } from 'lodash';
import { CacheKeys } from '@app/common/config/config.constants';
import { UsersService } from '../../../../apps/klubiq-dashboard/src/users/services/users.service';
import { ConfigService } from '@nestjs/config';
import { CreateNotificationDto } from '@app/notifications/dto/create-notification.dto';
import { NotificationsService } from '@app/notifications';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import {
	EmailInterfaceParams,
	EmailTemplates,
	EmailTypes,
} from '@app/common/email/types/email.types';

@Injectable()
export class PropertyEventsListener {
	private readonly orgAdminRoleId: number;
	private readonly supportEmail: string;
	private readonly clientBaseUrl: string;
	private readonly logger = new Logger(PropertyEventsListener.name);
	constructor(
		private readonly userService: UsersService,
		private readonly configService: ConfigService,
		private readonly notificationService: NotificationsService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		@InjectQueue('notification') private emailQueue: Queue,
		private readonly eventEmitter: EventEmitter2,
	) {
		this.orgAdminRoleId = this.configService.get<number>('ORG_OWNER_ROLE_ID');
		this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
		this.clientBaseUrl = this.configService.get<string>('CLIENT_BASE_URL');
	}
	@OnEvent('property.created', { async: true })
	async handlePropertyCreatedEvent(payload: PropertyEvent) {
		await this.invalidateOrganizationPropertyCache(payload);
		await this.createEmailNotification(payload);
	}

	@OnEvent('property.list')
	handlePropertyListing(payload: any) {
		console.debug('Property listing event', payload);
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

	private async createAndSendPropertyNotification(payload: PropertyEvent) {
		const template = this.getPropertyCreatedNotificationTemplate(payload);
		const notificationRecipients = await this.getNotificationRecipients(
			payload,
			template,
		);
		// const snsNotification: SNSNotificationDto = {
		// 	subject: template.subject,
		// 	message: template.message,
		// 	userIds: notificationRecipients.userIds,
		// 	emails: notificationRecipients.userEmails,
		// 	userNames: notificationRecipients.userNames,
		// 	type: template.type,
		// 	channels: ['EMAIL', 'PUSH'],
		// 	emailTemplateId: template.emailTemplateId,
		// };
		const notification: CreateNotificationDto[] =
			notificationRecipients.notificationDtos;
		await this.notificationService.createNotifications(notification);
		// snsNotification.notificationIds = notificationIds;
		// await this.notificationService.publishNotification(snsNotification);
	}

	private async getEmailTemplate(
		payload: PropertyEvent,
		eventType: string,
		recipients: any[],
	) {
		const emailTemplate = EmailTemplates[eventType];
		console.log('Email Recipients: ', recipients);
		if (emailTemplate) {
			const emailParams = {
				to: recipients,
				body: emailTemplate,
				subject: emailTemplate.subject,
				from: this.supportEmail,
				from_name: 'Klubiq',
			} as EmailInterfaceParams;
			const personalization = map(recipients, (recipient) => {
				return {
					email: recipient.email,
					data: {
						property_name: payload.name,
						property_address: payload.propertyAddress,
						unit_count: payload.totalUnits,
						support_email: this.supportEmail,
						view_property_link: `${this.clientBaseUrl}/properties/${payload.propertyId}`,
					},
				};
			});
			return {
				emailParams,
				personalization,
			};
		}
	}

	private async createEmailNotification(payload: PropertyEvent) {
		console.log('Creating Email Notification');
		const template = this.getPropertyCreatedNotificationTemplate(payload);
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
		};
		const data = {
			emailTemplate: EmailTypes.PROPERTY_CREATED,
			notificationIds,
			recipients: notificationRecipients.emailRecipients,
			personalization,
		};
		console.log('Sending Email Notification to queue. Data: ', data);
		const job = await this.emailQueue.add('send-email', data, { lifo: true });
		return {
			jobId: job.id,
			jobName: job.name,
		};
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
