import { CacheKeys } from '@app/common/config/config.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'apps/klubiq-dashboard/src/users/services/users.service';
import { each, transform } from 'lodash';
import { PropertyEvent } from '../event-models/property-event';
import { Cache } from 'cache-manager';
import { EVENTS, EventTemplate } from '../event-models/event-constants';
import { UserDetailsDto } from 'apps/klubiq-dashboard/src/users/dto/org-user.dto';

@Injectable()
export class HelperService {
	private readonly orgAdminRoleId: number;
	private readonly propertyManagerRecipientsEvent = [EVENTS.PROPERTY_CREATED];
	private readonly propertyUserRecipientsEvent = [EVENTS.PROPERTY_ASSIGNED];
	constructor(
		private readonly userService: UsersService,
		private readonly configService: ConfigService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {
		this.orgAdminRoleId = this.configService.get<number>('ORG_OWNER_ROLE_ID');
	}

	async deleteItemFromCache(key: string) {
		await this.cacheManager.del(key);
	}
	async invalidateOrganizationPropertyCache(payload: PropertyEvent) {
		const propertyCacheKeys = this.getPropertyRelatedCacheKeys(
			payload.organizationId,
		);
		each(propertyCacheKeys, async (key) => {
			const cacheData = await this.cacheManager.get(key);
			if (cacheData && key.includes('getPropertyListKeys')) {
				this.deletePropertyFilteredCacheKeys(cacheData as string[]);
			} else {
				await this.cacheManager.del(key);
			}
		});
	}
	private deletePropertyFilteredCacheKeys(keys: string[]) {
		each(keys, async (key) => {
			await this.cacheManager.del(key);
		});
	}

	private getPropertyRelatedCacheKeys(organizationId: string) {
		return [
			`${organizationId}/getPropertyListKeys`,
			`dashboard/${CacheKeys.PROPERTY_METRICS}/${organizationId}`,
			`properties-grouped-units/${organizationId}`,
		];
	}

	async getNotificationRecipients(
		payload: PropertyEvent,
		template: EventTemplate,
		eventType: EVENTS,
	) {
		const {
			organizationId,
			propertyManagerEmail,
			propertyManagerName,
			propertyManagerId,
			assignedToEmail,
			assignedToId,
			assignedToName,
		} = payload;
		let users: UserDetailsDto[] = [];
		if (this.propertyManagerRecipientsEvent.includes(eventType)) {
			const names = propertyManagerName.split[' '];
			const admin_recipients = await this.userService.getOrgUsersByRoleId(
				this.orgAdminRoleId,
				organizationId,
			);
			const manager_recipient: UserDetailsDto = {
				userId: propertyManagerId,
				email: propertyManagerEmail,
				firstName: names[0],
				lastName: names.length > 1 && names[1],
			};
			users = [...users, manager_recipient, ...admin_recipients];
		} else {
			const admin_recipients = await this.userService.getOrgUsersByRoleId(
				this.orgAdminRoleId,
				organizationId,
			);
			users = [...users, ...admin_recipients];
		}
		if (this.propertyUserRecipientsEvent.includes(eventType)) {
			const names = assignedToName.split[' '];
			const recipients: UserDetailsDto = {
				userId: assignedToId,
				email: assignedToEmail,
				firstName: names[0],
				lastName: names.length > 1 && names[1],
			};
			users = [...users, recipients];
		}
		const notificationRecipients = transform(
			users,
			(result, user) => {
				result.userIds.push(user.userId);
				result.emailRecipients.push({
					email: user.email,
					firstName: user.firstName,
				});
				result.notificationDtos.push({
					userId: user.userId,
					title: template.subject,
					message: template.message,
					type: template.type,
					propertyId:
						eventType === EVENTS.PROPERTY_DELETED ? null : payload.propertyId,
					organizationUuid: payload.organizationId,
				});
			},
			{ userIds: [], emailRecipients: [], notificationDtos: [] },
		);
		// if (
		//     !notificationRecipients.userIds.includes(propertyManagerId) &&
		//     this.propertyManagerRecipientsEvent.includes(eventType)
		// ) {
		//     notificationRecipients.userIds.push(propertyManagerId);
		//     notificationRecipients.emailRecipients.push({
		//         email: propertyManagerEmail,
		//         firstName: propertyManagerName,
		//     });
		//     notificationRecipients.notificationDtos.push({
		//         userId: propertyManagerId,
		//         title: template.subject,
		//         message: template.message,
		//         type: template.type,
		//         propertyId: payload.propertyId,
		//         organizationUuid: payload.organizationId,
		//     });
		// }
		return notificationRecipients;
	}
	queueOption() {
		return {
			lifo: false,
			removeOnComplete: true,
			removeOnFail: true,
		};
	}
}
