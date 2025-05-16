import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import {
	EmailInterfaceParams,
	EmailRecipient,
	EmailTemplate,
} from './types/email.types';

@Injectable()
export class MailerSendService {
	private readonly mailerSend: MailerSend;
	private readonly apiKey: string;
	private readonly supportEmail: string;
	private readonly transactionalEmailSender: string;
	private readonly transactionalEmailSenderName: string;
	private readonly logger = new Logger(MailerSendService.name);
	private readonly emailCopyrightText: string;

	constructor(private readonly configService: ConfigService) {
		this.apiKey = this.configService.get('EMAIL_API_KEY');
		this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
		this.transactionalEmailSender = this.configService.get<string>(
			'TRANSACTIONAL_EMAIL_SENDER',
		);
		this.transactionalEmailSenderName = this.configService.get<string>(
			'TRANSACTIONAL_EMAIL_SENDER_NAME',
		);
		this.emailCopyrightText = this.configService.get<string>(
			'EMAIL_COPYRIGHT_TEXT',
		);
		this.mailerSend = new MailerSend({ apiKey: this.apiKey });
	}

	async sendEmail(params: EmailInterfaceParams, personalization: any) {
		const sentFrom = new Sender(`${params.from}`, `${params.from_name}`);
		const myRecipients = params.to.map(
			(oneRecipient) =>
				new Recipient(
					oneRecipient.email,
					`${oneRecipient?.firstName ?? ''} ${oneRecipient?.lastName ?? ''}`,
				),
		);

		const templatedEmailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo(myRecipients)
			.setSubject(params.subject)
			.setHtml(params.body.html)
			.setText(params.body.text)
			.setPersonalization(personalization);

		try {
			this.logger.debug('Attempting to send email:', {
				from: params.from,
				to: params.to.map((r) => r.email),
				subject: params.subject,
				personalization: personalization,
			});
			const response = await this.mailerSend.email.send(templatedEmailParams);

			// Check for trial account restrictions
			if (response.statusCode === 422) {
				if (response.body?.message?.includes('Trial accounts')) {
					this.logger.warn(
						'MailerSend trial account restriction: ' + response.body.message,
					);
				}

				// For development/testing, you might want to log the email instead of failing
				if (process.env.NODE_ENV !== 'production') {
					this.logger.debug('Email would have been sent:', {
						to: params.to.map((r) => r.email),
						subject: params.subject,
						template: params.body.html,
					});
					return 'Email logged (trial account restriction)';
				}

				throw new Error(
					'Email service is currently restricted. Please contact support.',
				);
			}

			if (response.statusCode !== 201) {
				throw new Error(
					`MailerSend API error: ${response.body?.message || 'Unknown error'}`,
				);
			}

			return 'Email sent successfully';
		} catch (error) {
			this.logger.error(
				`Failed to send email. MailerSend API error: ${error.message}`,
				{
					error: error.body || error,
					recipients: params.to.map((r) => r.email),
					subject: params.subject,
				},
			);

			// For development/testing, you might want to log the email instead of failing
			if (process.env.NODE_ENV !== 'production') {
				this.logger.debug('Email would have been sent:', {
					to: params.to.map((r) => r.email),
					subject: params.subject,
					template: params.body.html,
				});
				return 'Email logged (development mode)';
			}

			throw new Error(
				`Failed to send email: ${error.body?.message || error.message}`,
			);
		}
	}

	async sendTransactionalEmail(
		emailRecipient: EmailRecipient,
		actionLink: string,
		emailTemplate: EmailTemplate,
		customData?: { [key: string]: any },
	) {
		const personalization = [
			{
				email: emailRecipient.email,
				data: {
					username: emailRecipient.firstName,
					action_link: actionLink,
					support_email: this.supportEmail,
					copyright: this.emailCopyrightText,
					...customData,
				},
			},
		];

		const emailParams = {
			to: [emailRecipient],
			body: emailTemplate,
			subject: emailTemplate.subject,
			from: this.transactionalEmailSender,
			from_name: this.transactionalEmailSenderName,
		} as EmailInterfaceParams;

		return this.sendEmail(emailParams, personalization);
	}
}
