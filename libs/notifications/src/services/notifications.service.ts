import { ActiveUserData } from '@app/auth';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { NotificationsRepository } from '../notifications.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { forEach } from 'lodash';
import { DateTime } from 'luxon';

@Injectable()
export class NotificationsService {
	private readonly logger = new Logger(NotificationsService.name);
	private currentUser: ActiveUserData;

	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		private readonly notificationsRepository: NotificationsRepository,
	) {}

	async createNotifications(createNotificationsDto: CreateNotificationDto[]) {
		const Notifications = this.notificationsRepository.create(
			createNotificationsDto,
		);
		return this.notificationsRepository.save(Notifications);
	}

	async getUserNotifications(userId: string, isRead?: boolean) {
		const query = this.notificationsRepository
			.createQueryBuilder('notifications')
			.where('notifications.userId = :userId', { userId });
		if (isRead) {
			query.andWhere('notifications.isRead = :isRead', { isRead });
		}
		return query.orderBy('notifications.createdAt', 'DESC').getMany();
	}

	async markAsRead(ids: string[]) {
		forEach(ids, (id) => {
			this.notificationsRepository.update(
				{ id },
				{ isRead: true, readAt: DateTime.utc().toJSDate() },
			);
		});
	}

	async deleteNotifications(ids: string[]) {
		return this.notificationsRepository.delete(ids);
	}
}
