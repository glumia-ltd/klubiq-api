import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
	EmailInterfaceParams,
	EmailRecipient,
	EmailTemplate,
} from './types/email.types';

@Injectable()
export class ZohoEmailService {
	private readonly transporter: nodemailer.Transporter;
	private readonly supportEmail: string;
	private readonly transactionalEmailSender: string;
	private readonly transactionalEmailSenderName: string;
	private readonly logger = new Logger(ZohoEmailService.name);
	private readonly emailCopyrightText: string;

	constructor(private readonly configService: ConfigService) {
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

		// Initialize SMTP transporter
		this.transporter = nodemailer.createTransport({
			host: 'smtppro.zoho.com',
			port: 465,
			secure: true, // use SSL
			auth: {
				user: this.configService.get<string>('ZOHO_EMAIL_USER'),
				pass: this.configService.get<string>('ZOHO_EMAIL_PASSWORD'),
			},
		});
	}

	async sendEmail(params: EmailInterfaceParams, personalization: any) {
		try {
			// Replace template variables with personalization data
			let html = params.body.html;
			let text = params.body.text;

			if (personalization && personalization[0]?.data) {
				const data = personalization[0].data;
				Object.keys(data).forEach((key) => {
					const regex = new RegExp(`{{ ${key} }}`, 'g');
					html = html.replace(regex, data[key]);
					if (text) {
						text = text.replace(regex, data[key]);
					}
				});
			}

			const mailOptions = {
				from: `"${params.from_name}" <${params.from}>`,
				to: params.to
					.map((recipient) =>
						recipient.firstName && recipient.lastName
							? `"${recipient.firstName} ${recipient.lastName}" <${recipient.email}>`
							: recipient.email,
					)
					.join(', '),
				subject: params.subject,
				html,
				text,
			};

			const info = await this.transporter.sendMail(mailOptions);
			this.logger.debug('Email sent successfully:', info.messageId);
			return 'Email sent successfully';
		} catch (error) {
			this.logger.error('Failed to send email:', {
				error: error.message,
				recipients: params.to.map((r) => r.email),
				subject: params.subject,
			});
			throw new Error(`Failed to send email: ${error.message}`);
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
