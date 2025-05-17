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
			this.logger.warn('Email Personalization: ', personalization);
			// Replace template variables with personalization data
			let html = params.body.html;
			let text = params.body.text;

			if (personalization && personalization[0]?.data) {
				const { data } = personalization[0];

				// Handle action link first (both camelCase and snake_case)
				// Handle all link-related keys first
				Object.keys(data).forEach((key) => {
					if (key.toLowerCase().includes('link')) {
						const linkValue = data[key];
						if (linkValue) {
							// Handle both camelCase and snake_case versions of the key
							const keyVariations = [
								key, // original key
								key.replace(/_/g, ''), // remove underscores
								key.replace(/([A-Z])/g, '_$1').toLowerCase(), // convert to snake_case
								key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()), // convert to camelCase
							];

							// Create regex patterns for all variations
							const linkRegexes = keyVariations.map(
								(k) => new RegExp(`{{${k}}}|{${k}}`, 'g'),
							);

							// Replace all variations in HTML and text
							linkRegexes.forEach((regex) => {
								html = html.replace(regex, linkValue);
								if (text) {
									text = text.replace(regex, linkValue);
								}
							});
						}
					}
				});

				Object.keys(data).forEach((key) => {
					if (key.toLowerCase().includes('link')) {
						return;
					} // Skip as we handled it above
					const spacedDoubleRegex = new RegExp(`{{ ${key} }}`, 'g');
					const spacedSingleRegex = new RegExp(`{${key}}`, 'g');
					const doubleRegex = new RegExp(`{{${key}}}`, 'g');
					const singleRegex = new RegExp(`{${key}}`, 'g');
					const value = data[key] || '';
					html = html
						.replace(singleRegex, value)
						.replace(doubleRegex, value)
						.replace(spacedDoubleRegex, value)
						.replace(spacedSingleRegex, value);
					if (text) {
						text = text
							.replace(singleRegex, value)
							.replace(doubleRegex, value)
							.replace(spacedDoubleRegex, value)
							.replace(spacedSingleRegex, value);
					}
				});
			}

			const mailOptions = {
				from: {
					name: params.from_name,
					address: params.from,
				},
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
				headers: {
					'X-Entity-Ref-ID': 'klubiq-pms-email', // Unique identifier for your emails
					'List-Unsubscribe': '<mailto:unsubscribe@klubiq.com>', // Unsubscribe email
					'X-Auto-Response-Suppress': 'OOF, AutoReply', // Suppress auto-replies
					'X-Mailer': 'Klubiq Mailer', // Your mailer name
					'X-Organization': 'Klubiq', // Your organization name
					'X-Organization-Website': 'https://blog.klubiq.com', // Your website
					'X-Organization-Logo':
						'https://klubiqbranding.s3.us-east-2.amazonaws.com/2.png', // Your logo URL
				},
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
