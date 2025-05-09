import { CacheKeys } from '@app/common/config/config.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'apps/klubiq-dashboard/src/users/services/users.service';
import { each, transform } from 'lodash';
import {
	LeaseEvent,
	PropertyEvent,
	TenantEvent,
} from '../event-models/event-models';
import { Cache } from 'cache-manager';
import { EVENTS, EventTemplate } from '../event-models/event-constants';
import { UserDetailsDto } from 'apps/klubiq-dashboard/src/users/dto/org-user.dto';

@Injectable()
export class HelperService {
	private readonly orgAdminRoleId: number;
	private readonly propertyManagerRecipientsEvent = [
		EVENTS.PROPERTY_CREATED,
		EVENTS.LEASE_CREATED,
	];
	private readonly propertyUserRecipientsEvent = [EVENTS.PROPERTY_ASSIGNED];
	constructor(
		private readonly userService: UsersService,
		private readonly configService: ConfigService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {
		this.orgAdminRoleId = this.configService.get<number>('ORG_OWNER_ROLE_ID');
	}

	/**
	 * Deletes an item from cache
	 * @param key
	 */
	async deleteItemFromCache(key: string) {
		await this.cacheManager.del(key);
	}

	/**
	 * Invalidates an organization's property cache
	 * @param payload
	 */
	async invalidateOrganizationPropertyCache(payload: PropertyEvent) {
		const propertyCacheKeys = this.getPropertyRelatedCacheKeys(
			payload.organizationId,
		);
		each(propertyCacheKeys, async (key) => {
			const cacheData = await this.cacheManager.get(key);
			if (cacheData && key.includes('getPropertyListKeys')) {
				this.deleteFilteredCacheKeys(cacheData as string[]);
			} else {
				await this.cacheManager.del(key);
			}
		});
	}

	/**
	 * Invalidates an organization's lease cache
	 * @param payload
	 */
	async invalidateOrganizationLeaseCache(payload: LeaseEvent) {
		const leaseCacheKeys = this.getLeaseRelatedCacheKeys(
			payload.organizationId,
		);
		each(leaseCacheKeys, async (key) => {
			const cacheData = await this.cacheManager.get(key);
			if (cacheData && key.includes('getLeaseListKeys')) {
				this.deleteFilteredCacheKeys(cacheData as string[]);
			} else {
				await this.cacheManager.del(key);
			}
		});
	}

	/**
	 * Invalidates an organization's tenant cache
	 * @param payload
	 */
	async invalidateOrganizationTenantCache(payload: TenantEvent) {
		const tenantCacheKeys = this.getTenantRelatedCacheKeys(
			payload.organizationId,
		);
		each(tenantCacheKeys, async (key) => {
			const cacheData = await this.cacheManager.get(key);
			if (cacheData && key.includes('getTenantListKeys')) {
				this.deleteFilteredCacheKeys(cacheData as string[]);
			} else {
				await this.cacheManager.del(key);
			}
		});
	}

	/**
	 * Delete filtered cache by keys
	 * @param keys
	 */
	private deleteFilteredCacheKeys(keys: string[]) {
		each(keys, async (key) => {
			await this.cacheManager.del(key);
		});
	}

	/**
	 * Get property related cache keys for an organization
	 * @param organizationId
	 * @returns
	 */
	private getPropertyRelatedCacheKeys(organizationId: string) {
		return [
			`${organizationId}:getPropertyListKeys`,
			`dashboard:${CacheKeys.PROPERTY_METRICS}:${organizationId}`,
			`properties:grouped-units:${organizationId}`,
		];
	}

	/**
	 * Get lease related cache keys for an organization
	 * @param organizationId
	 * @returns
	 */
	private getLeaseRelatedCacheKeys(organizationId: string) {
		return [
			`${organizationId}:getLeaseListKeys`,
			`dashboard:${CacheKeys.LEASE_METRICS}:${organizationId}`,
			`dashboard:${CacheKeys.PROPERTY_METRICS}:${organizationId}`,
		];
	}

	/**
	 * Get lease related cache keys for an organization
	 * @param organizationId
	 * @returns
	 */
	private getTenantRelatedCacheKeys(organizationId: string) {
		return [
			`${organizationId}:getTenantListKeys`,
			`dashboard:${CacheKeys.LEASE_METRICS}:${organizationId}`,
			`dashboard:${CacheKeys.PROPERTY_METRICS}:${organizationId}`,
			`${organizationId}:getLeaseListKeys`,
			`${organizationId}:getPropertyListKeys`,
		];
	}

	/**
	 * Get notification recipients
	 * @param payload
	 * @param template
	 * @param eventType
	 * @returns
	 */
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
			const isManagerAdmin = admin_recipients.find(
				(user) => user.userId === propertyManagerId,
			);
			const manager_recipient: UserDetailsDto = {
				userId: propertyManagerId,
				email: propertyManagerEmail,
				firstName: names && names[0],
				lastName: names && names.length > 1 && names[1],
			};
			users = isManagerAdmin
				? [...admin_recipients]
				: [manager_recipient, ...admin_recipients];
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
				firstName: names[0] || '',
				lastName: (names.length > 1 && names[1]) || '',
			};
			users = [...users, recipients];
		}
		return transform(
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
					actionLink: payload.actionLink,
					actionText: payload.actionText,
					propertyId:
						eventType === EVENTS.PROPERTY_DELETED ? null : payload.propertyId,
					organizationUuid: payload.organizationId,
				});
			},
			{ userIds: [], emailRecipients: [], notificationDtos: [] },
		);
	}

	/**
	 * Get notification recipients by roles
	 * @param payload
	 * @param template
	 * @param eventType
	 * @param roles
	 * @returns
	 */
	async getNotificationRecipientsByRoles(
		payload: PropertyEvent | LeaseEvent,
		template: EventTemplate,
		eventType: EVENTS,
		roles: number[],
	) {
		let users: UserDetailsDto[] = [];
		if (this.propertyManagerRecipientsEvent.includes(eventType)) {
			const names = payload.propertyManagerName
				? payload.propertyManagerName.split[' ']
				: [];
			const admin_recipients = await this.userService.getOrgUsersInRoleIds(
				roles,
				payload.organizationId,
			);
			const isManagerAdmin = admin_recipients.find(
				(user) => user.userId === payload.propertyManagerId,
			);
			const manager_recipient: UserDetailsDto = {
				userId: payload.propertyManagerId,
				email: payload.propertyManagerEmail,
				firstName: (names && names.length > 1 && names[0]) || '',
				lastName: (names && names.length > 2 && names[1]) || '',
			};
			users = isManagerAdmin
				? [...admin_recipients]
				: [manager_recipient, ...admin_recipients];
		} else {
			const admin_recipients = await this.userService.getOrgUsersInRoleIds(
				roles,
				payload.organizationId,
			);
			users = [...users, ...admin_recipients];
		}
		if (this.propertyUserRecipientsEvent.includes(eventType)) {
			const names = payload.assignedToName
				? payload.assignedToName.split[' ']
				: [];
			const recipients: UserDetailsDto = {
				userId: payload.assignedToId,
				email: payload.assignedToEmail,
				firstName: names && names.length > 1 && names[0],
				lastName: names && names.length > 2 && names[1],
			};
			users = [...users, recipients];
		}
		return transform(
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
					actionLink: payload.actionLink,
					actionText: payload.actionText,
					propertyId:
						eventType === EVENTS.PROPERTY_DELETED ? null : payload.propertyId,
					organizationUuid: payload.organizationId,
				});
			},
			{ userIds: [], emailRecipients: [], notificationDtos: [] },
		);
	}
	queueOption() {
		return {
			lifo: false,
			removeOnComplete: true,
			removeOnFail: true,
		};
	}
}
