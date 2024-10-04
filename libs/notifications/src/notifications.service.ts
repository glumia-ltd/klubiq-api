import { ActiveUserData } from '@app/auth';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { NotificationsRepository } from './notifications.repository';
import { NotificationSubscriptionDto } from './dto/notification-subscription.dto';

@Injectable()
export class NotificationsService {
	private readonly logger = new Logger(NotificationsService.name);
	private currentUser: ActiveUserData;

	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		private readonly notificationRepository: NotificationsRepository,
	) {}

	async createOrUpdateNotificationSubscription(
		subscriptionDto: NotificationSubscriptionDto,
	) {
		this.currentUser = this.cls.get('currentUser');
		if (
			subscriptionDto.organizationUuid &&
			this.currentUser.organizationId !== subscriptionDto.organizationUuid
		) {
			throw new UnauthorizedException(
				'You are not authorized to perform this action',
			);
		}
		let userSubscription = await this.notificationRepository.findOne({
			where: {
				userEmail: subscriptionDto.userEmail,
			},
		});
		if (!userSubscription) {
			userSubscription = this.notificationRepository.create({
				userEmail: subscriptionDto.userEmail,
				organizationUuid: subscriptionDto.organizationUuid,
				subscription: subscriptionDto.subscription,
			});
		} else {
			userSubscription.subscription = {
				...userSubscription.subscription,
				...subscriptionDto.subscription,
			};
		}
		const result = await this.notificationRepository.save(userSubscription);
		return result;
	}

	async getUserSubscriptionDetails(userEmail: string[]) {
		const usersSubscriptions = await this.notificationRepository
			.createQueryBuilder('notificationSubscription')
			.select('notificationSubscription.subscription')
			.where('notificationSubscription.userEmail IN (:...userEmail)', {
				userEmail,
			})
			.getMany();
		return usersSubscriptions;
	}

	async getOrganizationSubscriptionDetails(organizationUuid: string) {
		const userSubscription = await this.notificationRepository
			.createQueryBuilder('notificationSubscription')
			.select('notificationSubscription.subscription')
			.where('notificationSubscription.organizationUuid = :organizationUuid', {
				organizationUuid,
			})

			.getMany();
		return userSubscription;
	}
}
