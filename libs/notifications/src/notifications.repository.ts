import { NotificationSubscription } from '@app/common/database/entities/notification-subscription.entity';
import { Notifications } from '@app/common/database/entities/notifications.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class NotificationsRepository extends BaseRepository<Notifications> {
	protected readonly logger = new Logger(NotificationsRepository.name);
	constructor(manager: EntityManager) {
		super(Notifications, manager);
	}
}

@Injectable()
export class NotificationsSubscriptionRepository extends BaseRepository<NotificationSubscription> {
	protected readonly logger = new Logger(NotificationsRepository.name);
	constructor(manager: EntityManager) {
		super(NotificationSubscription, manager);
	}
}
