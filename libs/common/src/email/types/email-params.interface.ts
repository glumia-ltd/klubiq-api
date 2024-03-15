export interface EmailInterfaceParams {
	from?: string;
	from_name?: string;
	to: Recipient[];
	subject: string;
	body: { text: string; html: string };
	reply_to?: ReplyTo;
	cc?: Recipient[];
	bcc?: Recipient[];
	headers?: { [key: string]: string };
	track_opens?: boolean;
	track_clicks?: boolean;
	tag?: string;
	vars?: { [key: string]: string };
	attachment?: Attachment;
}

export type Recipient = {
	email: string;
	name: string;
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

export const FromEmails = {
    support: '',
    name: ''
  };