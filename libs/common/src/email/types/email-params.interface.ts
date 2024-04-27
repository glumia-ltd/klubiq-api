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
	lastName: string;
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
