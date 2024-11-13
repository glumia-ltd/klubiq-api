import {
	inviteOrgUserTemplate,
	resetPasswordEmailTemplate,
	verifyEmailTemplate,
} from '../email-templates/transaction-emails.template';
import { propertyCreatedEmailTemplate } from '../email-templates/notification-email.templates';

export enum EmailTypes {
	EMAIL_VERIFICATION = 'email-verification',
	PASSWORD_RESET = 'password-reset',
	PASSWORD_CHANGE = 'password-change',
	ORG_USER_INVITE = 'org-user-invite',
	USER_INVITE_ACCEPT = 'user-invite-accept',
	WELCOME = 'welcome',
	PROPERTY_CREATED = 'property-created',
	PROPERTY_DELETED = 'property-deleted',
}
export interface EmailInterfaceParams {
	from?: string;
	from_name?: string;
	to: EmailRecipient[];
	subject: string;
	body: { text: string; html: string };
	reply_to?: ReplyTo;
	cc?: EmailRecipient[];
	bcc?: EmailRecipient[];
	headers?: { [key: string]: string };
	track_opens?: boolean;
	track_clicks?: boolean;
	tag?: string;
	vars?: { [key: string]: string };
	attachment?: Attachment;
}

export type EmailRecipient = {
	email: string;
	firstName: string;
	lastName?: string;
};

interface ReplyTo {
	email: string;
	name?: string;
}

interface Attachment {
	content: string;
	filename: string;
	type: string;
}

export interface EmailTemplate {
	text?: string;
	html: string;
	subject: string;
}

export const EmailTemplates: Record<EmailTypes, EmailTemplate> = {
	[EmailTypes.EMAIL_VERIFICATION]: verifyEmailTemplate(),
	[EmailTypes.PASSWORD_RESET]: resetPasswordEmailTemplate(),
	[EmailTypes.ORG_USER_INVITE]: inviteOrgUserTemplate(),
	[EmailTypes.WELCOME]: resetPasswordEmailTemplate(),
	[EmailTypes.PASSWORD_CHANGE]: resetPasswordEmailTemplate(),
	[EmailTypes.USER_INVITE_ACCEPT]: resetPasswordEmailTemplate(),
	[EmailTypes.PROPERTY_CREATED]: propertyCreatedEmailTemplate(),
	[EmailTypes.PROPERTY_DELETED]: propertyCreatedEmailTemplate(),
};
