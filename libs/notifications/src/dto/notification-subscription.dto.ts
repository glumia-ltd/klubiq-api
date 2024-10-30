import { Expose } from 'class-transformer';
import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export type PushSubscription = {
	endpoint: string;
	expirationTime: number;
	keys: {
		p256dh: string;
		auth: string;
	};
};
export class NotificationSubscriptionDto {
	@Expose()
	@IsString()
	userId: string; // User Email

	@Expose()
	@IsNotEmpty()
	subscription: Record<string, PushSubscription>; // Push subscription object

	@Expose()
	@IsEmpty()
	@IsString()
	organizationUuid?: string; // Organization UUID
}

export class NotificationPayloadDto {
	@Expose()
	title: string;
	@Expose()
	body: string;
	@Expose()
	data?: Record<string, any>;
	@Expose()
	actionLink?: string;
}

export class SendNotificationDto {
	@Expose()
	payload: NotificationPayloadDto;

	@Expose()
	userIds: string[];
}

export class SNSNotificationDto {
	@Expose()
	@IsString()
	@IsNotEmpty()
	message: string;

	@Expose()
	@IsString()
	subject: string;

	@Expose()
	@IsString({ each: true })
	emails: string[];

	@Expose()
	@IsString({ each: true })
	userIds: string[];

	@Expose()
	@IsString()
	organizationUuid?: string;

	@Expose()
	@IsString()
	type: string;

	@Expose()
	channels: string[];

	@Expose()
	userNames: string[];

	@Expose()
	@IsString()
	emailTemplateId: string;

	@Expose()
	notificationIds?: string[];
}
