import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'; // Assuming you have installed the 'mailersend' package
import {
	EmailInterfaceParams,
	FromEmails,
} from './types/email-params.interface';
import { verifyEmailTemplate } from './templates/verify-email.template';

@Injectable()
export class MailerSendService {
	private readonly mailerSend: MailerSend;
	private readonly apiKey: string;

	constructor(private readonly configService: ConfigService) {
		this.apiKey = this.configService.get('API_KEY');
		this.mailerSend = new MailerSend({ apiKey: this.apiKey }); // Set your API key
	}

	async sendEmail(params: EmailInterfaceParams) {
		const sentFrom = new Sender(`${params.from}`, `${params.from_name}`);
		let myRecipients = params.to.map((oneRecipient) => {
			new Recipient(`${oneRecipient.email}`, `${oneRecipient.name}`);
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
			console.log('Email sent successfully!'); // Log success message
			return 'Email sent successfully';
		} catch (error) {
			console.error('Failed to send email with MailerSend:', error);
			return 'Failed to send email';
		}
	}

	async sendVerifyEmail(
		userEmail: string,
		userName: string,
		verificationLink: string,
	) {
		const verifyEmailBody = verifyEmailTemplate(verificationLink);
		const recipient = { email: userEmail, name: userName };
		return this.sendEmail({
			to: [recipient],
			body: verifyEmailBody,
			subject: 'Verify Email',
			from: FromEmails.support,
			from_name: FromEmails.name,
		});
	}

	async sendDummmyEmail() {
		const userEmail = 'folakamar@gmail.com';
		const userName = 'Fola';
		const verificationLink = 'here is the dummyLink';
		const verifyEmailBody = verifyEmailTemplate(verificationLink);
		const recipient = { email: userEmail, name: userName };
		return this.sendEmail({
			to: [recipient],
			body: verifyEmailBody,
			subject: 'Verify Email',
			from: FromEmails.support,
			from_name: FromEmails.name,
		});
	}
}
