import {
	NotificationPeriod,
	NotificationPriority,
} from '@app/common/config/config.constants';
import { Expose, Type } from 'class-transformer';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

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
	@IsNotEmpty()
	subscription: Record<string, PushSubscription>; // Push subscription object

	@Expose()
	@IsString()
	organizationUuid?: string; // Organization UUID
}

export class NotificationPayloadDto {
	@Expose()
	@IsNotEmpty()
	@IsString()
	title: string;

	@Expose()
	@IsNotEmpty()
	@IsString()
	body: string;

	@Expose()
	@IsOptional()
	data?: Record<string, any>;

	@Expose()
	@IsOptional()
	@IsString()
	actionLink?: string;
}

export class SendNotificationDto {
	@Expose()
	@ValidateNested()
	@Type(() => NotificationPayloadDto)
	payload: NotificationPayloadDto;

	@Expose()
	@IsNotEmpty()
	@IsString({ each: true })
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
export class NotificationResponseDto {
	total: number;
	notifications: groupedNotification[];
}
export class NotificationsDto {
	actionLink?: string;
	actiontText?: string;
	createdAt: Date;
	data?: Record<string, any>;
	expiresAt?: Date;
	id: string;
	isRead: boolean;
	isAnnouncement: boolean;
	leaseId?: number;
	message: string;
	organizationUuid?: string;
	propertyId?: string;
	priority?: NotificationPriority;
	readAt?: Date;
	title: string;
	type: string;
	unitId?: number;
	userId?: string;
	time?: string;
}

export class groupedNotification {
	period: NotificationPeriod;
	notifications: NotificationsDto[];
}
