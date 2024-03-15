import * as nodemailer from 'nodemailer';
import { EmailInterfaceParams, FromEmails } from './types/email-params.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyEmailTemplate } from './templates/verify-email.template';


@Injectable()
export class MailerSendSMTPService {
    private readonly transporter: nodemailer.Transport;

    constructor(private readonly configService: ConfigService) {
        // Retrieve SMTP credentials (username, password, server, port) from configuration
        const username = this.configService.get('MAILER_SEND_SMTP_USERNAME');
        const password = this.configService.get('MAILER_SEND_SMTP_PASSWORD');
        const server = this.configService.get('MAILER_SEND_SMTP_SERVER');
        const port = this.configService.get('MAILER_SEND_SMTP_PORT');

        // Create SMTP transporter with secure connection
        this.transporter = nodemailer.createTransport({
            host: server,
            port,
            secure: true, // Use TLS for secure communication
            auth: {
                user: username,
                pass: password,
            },
        });
    }

    async sendEmail(params: EmailInterfaceParams) {
        const mailOptions = {
            from: `${params.from}`, // Construct "from" address
            to: params.to.map((recipient) => recipient.email).join(', '), // Join recipient emails
            replyTo: params.from,
            subject: params.subject,
            html: params.body.html,
            text: params.body.text,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return 'Email sent successfully';
        } catch (error) {
            console.error('Failed to send email:', error);
            return 'Failed to send email';
        }
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
