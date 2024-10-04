import { NotificationSubscription } from '@app/common/database/entities/notification-subscription.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class NotificationsRepository extends BaseRepository<NotificationSubscription> {
	protected readonly logger = new Logger(NotificationsRepository.name);
	constructor(manager: EntityManager) {
		super(NotificationSubscription, manager);
	}
}
