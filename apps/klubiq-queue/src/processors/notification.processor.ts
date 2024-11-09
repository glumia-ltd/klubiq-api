import { MailerSendService } from '@app/common/email/email.service';
import {
	EmailInterfaceParams,
	EmailRecipient,
	EmailTemplates,
} from '@app/common/email/types/email.types';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { map } from 'lodash';
import { console } from 'node:inspector/promises';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
	private readonly logger = new Logger(NotificationProcessor.name);
	private readonly supportEmail: string;
	constructor(
		private readonly mailerSendService: MailerSendService,
		private readonly configService: ConfigService,
	) {
		super();
		this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
	}
	async process(job: Job<any, any, any>): Promise<any> {
		console.log(`Processing job ${job.id}`);
		const { emailTemplate, notificationIds, recipients, personalization } =
			job.data;
		const is_sent = await this.buildAndSendEmail(
			emailTemplate,
			recipients,
			personalization,
		);
		return { is_sent, notificationIds };
	}
	@OnWorkerEvent('completed')
	onJobCompleted(jobId: string, result: any) {
		this.logger.log(`Job ${jobId} completed with result: ${result}`);
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
}
