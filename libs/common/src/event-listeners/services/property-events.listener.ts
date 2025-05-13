import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PropertyEvent } from '../event-models/event-models';
import { ConfigService } from '@nestjs/config';
import { CreateNotificationDto } from '@app/notifications/dto/create-notification.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { EmailTypes } from '@app/common/email/types/email.types';
import { EVENT_TEMPLATE, EVENTS } from '../event-models/event-constants';
import { NotificationsService } from '@app/notifications/services/notifications.service';
import { NotificationPayloadDto } from '@app/notifications/dto/notification-subscription.dto';
import { HelperService } from './listeners-helper';

@Injectable()
export class PropertyEventsListener {
	private readonly supportEmail: string;
	private readonly clientBaseUrl: string;
	private readonly emailCopyrightText: string;
	private readonly logger = new Logger(PropertyEventsListener.name);
	constructor(
		private readonly configService: ConfigService,
		private readonly notificationService: NotificationsService,
		private readonly helperService: HelperService,
		@InjectQueue('notification') private notificationQueue: Queue,
	) {
		this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
		this.clientBaseUrl = this.configService.get<string>('CLIENT_BASE_URL');
		this.emailCopyrightText = this.configService.get<string>(
			'EMAIL_COPYRIGHT_TEXT',
		);
	}
	@OnEvent(EVENTS.PROPERTY_CREATED, { async: true })
	async handlePropertyCreatedEvent(payload: PropertyEvent) {
		await this.helperService.invalidateOrganizationPropertyCache(payload);
		await this.createEmailNotification(
			payload,
			EVENTS.PROPERTY_CREATED,
			EmailTypes.PROPERTY_CREATED,
		);
	}

	@OnEvent(EVENTS.PROPERTY_DELETED, { async: true })
	async handlePropertyDeletedEvent(payload: PropertyEvent) {
		await this.helperService.invalidateOrganizationPropertyCache(payload);
		await this.createEmailNotification(
			payload,
			EVENTS.PROPERTY_DELETED,
			EmailTypes.PROPERTY_DELETED,
		);
	}

	@OnEvent(EVENTS.PROPERTY_UPDATED, { async: true })
	@OnEvent(EVENTS.PROPERTY_ARCHIVED, { async: true })
	async handlePropertyUpdatedOrArchivedEvent(payload: PropertyEvent) {
		if (payload.invalidateCache) {
			await this.helperService.invalidateOrganizationPropertyCache(payload);
		}
	}

	@OnEvent(EVENTS.PROPERTY_ASSIGNED, { async: true })
	async handlePropertyAssignedEvent(payload: PropertyEvent) {
		await this.helperService.deleteItemFromCache(
			`properties:${payload.propertyId}`,
		);
		await this.createEmailNotification(
			payload,
			EVENTS.PROPERTY_ASSIGNED,
			EmailTypes.PROPERTY_ASSIGNED,
		);
	}

	private async createEmailNotification(
		payload: PropertyEvent,
		propertyEvent: EVENTS,
		emailTemplate: EmailTypes,
	) {
		payload.actionLink = `${this.clientBaseUrl}properties/${payload.propertyId}`;
		payload.actionText = 'View Property';
		const template = EVENT_TEMPLATE(payload)[propertyEvent];
		const notificationRecipients =
			await this.helperService.getNotificationRecipients(
				payload,
				template,
				propertyEvent,
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
			view_property_link: payload.actionLink,
			copyright: this.emailCopyrightText,
			event_date: payload.eventTimestamp || new Date().toUTCString(),
		};
		if (propertyEvent === EVENTS.PROPERTY_DELETED) {
			personalization['deleted_by'] = payload.propertyManagerName;
			personalization['deletion_date'] = payload.eventTimestamp;
		} else if (propertyEvent === EVENTS.PROPERTY_ASSIGNED) {
			personalization['assigned_by'] = payload.propertyManagerName;
		}
		const data = {
			emailTemplate: emailTemplate,
			notificationIds,
			recipients: notificationRecipients.emailRecipients,
			personalization,
			userIds: notificationRecipients.userIds,
			channels: ['EMAIL', 'WEB-PUSH'],
			notificationData: {
				title: template.subject,
				body: template.message,
				data: {
					metadata: {
						propertyId:
							propertyEvent === EVENTS.PROPERTY_DELETED
								? null
								: payload.propertyId,
						organizationUuid: payload.organizationId,
					},
				},
				actionLink:
					propertyEvent === EVENTS.PROPERTY_DELETED ? null : payload.actionLink,
			} as NotificationPayloadDto,
		};
		//console.log('NOTIFICATION DATA: ', data);
		await this.notificationQueue.add(
			'notify',
			data,
			this.helperService.queueOption(),
		);
	}
}
