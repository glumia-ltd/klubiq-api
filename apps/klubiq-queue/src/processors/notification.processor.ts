import { MailerSendService } from '@app/common/email/email.service';
import {
	EmailInterfaceParams,
	EmailRecipient,
	EmailTemplates,
} from '@app/common/email/types/email.types';
import {
	InjectQueue,
	OnWorkerEvent,
	Processor,
	WorkerHost,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bullmq';
import { each, map } from 'lodash';
import { postJobAction } from './job-constants';
import axios from 'axios';
import {
	NotificationPayloadDto,
	SendNotificationDto,
} from '@app/notifications/dto/notification-subscription.dto';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
	private readonly logger = new Logger(NotificationProcessor.name);
	private readonly supportEmail: string;
	private readonly APIPort: number;
	constructor(
		private readonly mailerSendService: MailerSendService,
		private readonly configService: ConfigService,
		@InjectQueue('notification-results')
		private notificationResultsQueue: Queue,
	) {
		super();
		this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
		this.APIPort = this.configService.get<number>('APP_PORT');
	}
	async process(job: Job<any, any, any>): Promise<any> {
		const {
			emailTemplate,
			notificationIds,
			recipients,
			personalization,
			channels,
			userIds,
			notificationData,
		} = job.data;

		each(channels, async (channel) => {
			if (channel === 'EMAIL') {
				await this.buildAndSendEmail(
					emailTemplate,
					recipients,
					personalization,
				);
				this.notificationResultsQueue.add(
					'email-delivered',
					{
						notificationIds,
						action: postJobAction.MARK_AS_DELIVERED,
					},
					{
						removeOnComplete: true,
						removeOnFail: 3,
						delay: 10000,
						attempts: 3,
					},
				);
			} else if (channel === 'WEB-PUSH') {
				console.log('PUSH to users', userIds);
				this.sendPushNotification(notificationData, userIds);
			}
		});
	}
	@OnWorkerEvent('completed')
	async onJobCompleted(jobId: any) {
		console.log(`Job ${jobId} completed with result`);
	}

	@OnWorkerEvent('active')
	onJobActive(jobId: string) {
		this.logger.log(`Job ${jobId} is active`);
		console.log(`Job ${jobId} is active`);
	}

	@OnWorkerEvent('failed')
	onJobFailed(jobId: string, failedReason: any) {
		this.logger.error(
			`Job ${jobId} failed with reason: ${JSON.stringify(failedReason)}`,
		);
		console.error(
			`Job ${jobId} failed with reason: ${JSON.stringify(failedReason)}`,
		);
	}
	private async buildAndSendEmail(
		templateName: string,
		recipients: EmailRecipient[],
		personalizationData?: any,
	) {
		const emailTemplate = EmailTemplates[templateName];
		if (emailTemplate) {
			const emailParams = {
				to: recipients,
				body: emailTemplate,
				subject: emailTemplate.subject,
				from: this.supportEmail,
				from_name: 'Klubiq',
			} as EmailInterfaceParams;
			const personalization = map(recipients, (recipient) => {
				personalizationData['first_name'] = recipient.firstName;
				return {
					email: recipient.email,
					data: personalizationData || {},
				};
			});
			return await this.mailerSendService.sendEmail(
				emailParams,
				personalization,
			);
		}
	}

	private async sendPushNotification(
		notificationData: NotificationPayloadDto,
		userIds: string[],
	) {
		try {
			const body: SendNotificationDto = {
				payload: notificationData,
				userIds,
			};
			const response = await axios.post(
				`http://localhost:${this.APIPort}/api/notifications/send-web-notification`,
				JSON.stringify(body),
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
			console.log(`Notifications sent to: ${userIds}`, response.data);
		} catch (error) {
			this.logger.error(`Error sending push notification: ${error}`);
		}
	}
}
