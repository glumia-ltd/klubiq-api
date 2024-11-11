import { ActiveUserData } from '@app/auth';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { NotificationsSubscriptionRepository } from '../notifications.repository';
import { NotificationSubscriptionDto } from '../dto/notification-subscription.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsSubscriptionService {
	private readonly logger = new Logger(NotificationsSubscriptionService.name);
	private currentUser: ActiveUserData;

	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		private readonly configService: ConfigService,
		private readonly notificationsSubscriptionRepository: NotificationsSubscriptionRepository,
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
		let userSubscription =
			await this.notificationsSubscriptionRepository.findOne({
				where: {
					userId: subscriptionDto.userId,
				},
			});
		if (!userSubscription) {
			userSubscription = this.notificationsSubscriptionRepository.create({
				userId: subscriptionDto.userId,
				organizationUuid: subscriptionDto.organizationUuid,
				subscription: subscriptionDto.subscription,
			});
		} else {
			userSubscription.subscription = {
				...userSubscription.subscription,
				...subscriptionDto.subscription,
			};
		}
		const result =
			await this.notificationsSubscriptionRepository.save(userSubscription);
		return result;
	}

	async getUserSubscriptionDetails(userEmail: string[]) {
		const usersSubscriptions = await this.notificationsSubscriptionRepository
			.createQueryBuilder('notificationSubscription')
			.select('notificationSubscription.subscription')
			.where('notificationSubscription.userEmail IN (:...userEmail)', {
				userEmail,
			})
			.getMany();
		return usersSubscriptions;
	}

	async getOrganizationSubscriptionDetails(organizationUuid: string) {
		const userSubscription = await this.notificationsSubscriptionRepository
			.createQueryBuilder('notificationSubscription')
			.select('notificationSubscription.subscription')
			.where('notificationSubscription.organizationUuid = :organizationUuid', {
				organizationUuid,
			})
			.getMany();
		return userSubscription;
	}

	async deleteSubscription(id: string) {
		await this.notificationsSubscriptionRepository.delete({ id });
	}
}
