import { Expose } from 'class-transformer';
import { IsEmail, IsEmpty, IsNotEmpty, IsString } from 'class-validator';

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
	@IsEmail()
	userEmail: string; // User Email

	@Expose()
	@IsNotEmpty()
	subscription: Record<string, PushSubscription>; // Push subscription object

	@Expose()
	@IsEmpty()
	@IsString()
	organizationUuid?: string; // Organization UUID
}

export class NotificationDto {
	@Expose()
	data: {
		title: string;
		body: string;
	};
	@Expose()
	userEmails: string[];
}
