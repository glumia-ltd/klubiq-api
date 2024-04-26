import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'; // Assuming you have installed the 'mailersend' package
import {
	EmailInterfaceParams,
	EmailRecipient,
} from './types/email-params.interface';
import { verifyEmailTemplate } from './templates/verify-email.template';

@Injectable()
export class MailerSendService {
	private readonly mailerSend: MailerSend;
	private readonly apiKey: string;

	constructor(private readonly configService: ConfigService) {
		this.apiKey = this.configService.get('EMAIL_API_KEY');
		this.mailerSend = new MailerSend({ apiKey: this.apiKey }); // Set your API key
	}

	async sendEmail(params: EmailInterfaceParams) {
		const sentFrom = new Sender(`${params.from}`, `${params.from_name}`);
		const myRecipients = params.to.map((oneRecipient) => {
			new Recipient(
				`${oneRecipient.email}`,
				`${oneRecipient.firstName} ${oneRecipient.lastName}`,
			);
			return oneRecipient;
		});

		const emailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo(myRecipients)
			.setReplyTo(sentFrom)
			.setSubject(params.subject)
			.setHtml(params.body.html)
			.setText(params.body.text);

		try {
			const response = await this.mailerSend.email.send(emailParams);
			if (response.statusCode == 201) {
				throw new Error(`MailerSend API error: ${response.body}`);
			}
			return 'Email sent successfully';
		} catch (error) {
			console.error('Failed to send email with MailerSend:', error);
			return 'Failed to send email';
		}
	}

	async sendVerifyEmail(
		emailRecipient: EmailRecipient,
		verificationLink: string,
	) {
		const verifyEmailBody = verifyEmailTemplate(verificationLink);
		const personalization = [
			{
				email: emailRecipient.email,
				data: {
					username: emailRecipient.firstName,
					support_email: this.configService.get('SUPPORT_EMAIL'),
					verification_link: verificationLink,
				},
			},
		];
		const emailParams = {
			to: [emailRecipient],
			body: verifyEmailBody,
			subject: 'Verify Email',
			from: this.configService.get('TRANSACTIONAL_EMAIL_SENDER'),
			from_name: this.configService.get('TRANSACTIONAL_EMAIL_SENDER_NAME'),
		} as EmailInterfaceParams;
		return this.sendWithTemplate(
			emailParams,
			this.configService.get('EMAIL_VERIFICATION_TEMPLATE'),
			personalization,
		);
	}

	async sendWithTemplate(
		params: EmailInterfaceParams,
		templaateId: string,
		personalization: any,
	) {
		const sentFrom = new Sender(`${params.from}`, `${params.from_name}`);
		const myRecipients = params.to.map((oneRecipient) => {
			new Recipient(
				`${oneRecipient.email}`,
				`${oneRecipient.firstName} ${oneRecipient.lastName}`,
			);
			return oneRecipient;
		});
		const templatedEmailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo(myRecipients)
			.setReplyTo(sentFrom)
			.setSubject(params.subject)
			.setTemplateId(templaateId)
			.setPersonalization(personalization);
		try {
			const response = await this.mailerSend.email.send(templatedEmailParams);
			if (response.statusCode == 201) {
				throw new Error(`MailerSend API error: ${response.body}`);
			}
			return 'Email sent successfully';
		} catch (error) {
			console.error('Failed to send email with MailerSend:', error);
			return 'Failed to send email';
		}
	}
}
