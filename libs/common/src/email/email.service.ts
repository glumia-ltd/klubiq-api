import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'; // Assuming you have installed the 'mailersend' package
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

	constructor(private readonly configService: ConfigService) {
		this.apiKey = this.configService.get('EMAIL_API_KEY');
		this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
		this.transactionalEmailSender = this.configService.get<string>(
			'TRANSACTIONAL_EMAIL_SENDER',
		);
		this.transactionalEmailSenderName = this.configService.get<string>(
			'TRANSACTIONAL_EMAIL_SENDER_NAME',
		);
		this.mailerSend = new MailerSend({ apiKey: this.apiKey }); // Set your API key
	}

	async sendTransactionalEmail(
		emailRecipient: EmailRecipient,
		actionLink: string,
		emailTemplate: EmailTemplate,
		customData?: { [key: string]: any },
	) {
		const verifyEmailBody = emailTemplate;
		const personalization = [
			{
				email: emailRecipient.email,
				data: {
					username: emailRecipient.firstName,
					support_email: this.configService.get('SUPPORT_EMAIL'),
					action_link: actionLink,
					...customData,
				},
			},
		];
		const emailParams = {
			to: [emailRecipient],
			body: verifyEmailBody,
			subject: verifyEmailBody.subject,
			from: this.transactionalEmailSender,
			from_name: this.transactionalEmailSenderName,
		} as EmailInterfaceParams;
		return this.sendEmail(emailParams, personalization);
	}

	async sendEmail(params: EmailInterfaceParams, personalization: any) {
		const sentFrom = new Sender(`${params.from}`, `${params.from_name}`);
		const myRecipients = params.to.map(
			(oneRecipient) =>
				new Recipient(
					oneRecipient.email,
					`${oneRecipient.firstName} ${oneRecipient.lastName}`,
				),
		);
		const templatedEmailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo(myRecipients)
			.setReplyTo(sentFrom)
			.setSubject(params.subject)
			.setHtml(params.body.html)
			.setText(params.body.text)
			.setPersonalization(personalization);
		try {
			const response = await this.mailerSend.email.send(templatedEmailParams);
			if (response.statusCode === 201) {
				throw new Error(`MailerSend API error: ${response.body}`);
			}
			return 'Email sent successfully';
		} catch (error) {
			throw new Error(`Failed to send email. MailerSend API error: ${error}`);
		}
	}
}
