import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LeaseEvent } from '../event-models/event-models';
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
export class LeaseEventsListener {
	private readonly orgAdminRoleId: number;
	private readonly leaseManagerRoleId: number;
	private readonly supportEmail: string;
	private readonly clientBaseUrl: string;
	private readonly emailCopyrightText: string;
	private readonly logger = new Logger(LeaseEventsListener.name);
	private currencyFormat: Intl.NumberFormat;
	constructor(
		private readonly configService: ConfigService,
		private readonly notificationService: NotificationsService,
		private readonly helperService: HelperService,
		@InjectQueue('notification') private notificationQueue: Queue,
	) {
		this.orgAdminRoleId = this.configService.get<number>('ORG_OWNER_ROLE_ID');
		this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
		this.clientBaseUrl = this.configService.get<string>('CLIENT_BASE_URL');
		this.emailCopyrightText = this.configService.get<string>(
			'EMAIL_COPYRIGHT_TEXT',
		);
		this.leaseManagerRoleId = this.configService.get<number>(
			'LEASE_MANAGER_ROLE_ID',
		);
	}
	@OnEvent(EVENTS.LEASE_CREATED, { async: true })
	async handleLeaseCreatedEvent(payload: LeaseEvent) {
		await this.helperService.invalidateOrganizationLeaseCache(payload);
		if (payload.sendNotification) {
			this.currencyFormat = new Intl.NumberFormat(
				`${payload.language}-${payload.locale}`,
				{
					style: 'currency',
					currency: payload.currency,
				},
			);
			await this.createNotification(
				payload,
				EVENTS.LEASE_CREATED,
				EmailTypes.LEASE_CREATED,
			);
		}
	}

	private async createNotification(
		payload: LeaseEvent,
		leaseEvent: EVENTS,
		emailTemplate: EmailTypes,
	) {
		payload.actionLink = `${this.clientBaseUrl}lease/${payload.leaseId}`;
		payload.actionText = 'View Lease';
		const template = EVENT_TEMPLATE(payload)[leaseEvent];
		const notificationRecipients =
			await this.helperService.getNotificationRecipientsByRoles(
				payload,
				template,
				leaseEvent,
				[this.orgAdminRoleId, this.leaseManagerRoleId],
			);
		const notification: CreateNotificationDto[] =
			notificationRecipients.notificationDtos;
		const notificationIds =
			await this.notificationService.createNotifications(notification);
		const personalization = {
			property_name: payload.propertyName,
			unit_number: payload.unitNumber,
			support_email: this.supportEmail,
			start_date: payload.startDate,
			end_date: payload.endDate,
			lease_name: payload.leaseName,
			rent_amount:
				this.currencyFormat.format(Number(payload.rent)) || payload.rent,
			payment_frequency: payload.paymentFrequency,
			view_lease_details_link: payload.actionLink,
			copyright: this.emailCopyrightText,
			first_payment_date: payload.firstPaymentDate,
			event_date: payload.eventTimestamp || new Date().toUTCString(),
		};
		// if (leaseEvent === EVENTS.PROPERTY_DELETED) {
		//     personalization['deleted_by'] = payload.propertyManagerName;
		//     personalization['deletion_date'] = payload.eventTimestamp;
		// } else if (leaseEvent === EVENTS.PROPERTY_ASSIGNED) {
		//     personalization['assigned_by'] = payload.propertyManagerName;
		// }
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
					leaseId: payload.leaseId,
					organizationUuid: payload.organizationId,
				},
				actionLink: payload.actionLink,
				// leaseEvent === EVENTS.PROPERTY_DELETED
				//     ? null
				//     : `${this.clientBaseUrl}/properties/${payload.propertyId}`,
			} as NotificationPayloadDto,
		};
		await this.notificationQueue.add(
			'notify',
			data,
			this.helperService.queueOption(),
		);
	}
}
