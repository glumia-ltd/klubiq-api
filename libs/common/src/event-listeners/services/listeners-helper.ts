import { CacheKeys } from '@app/common/config/config.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'apps/klubiq-dashboard/src/users/services/users.service';
import { transform } from 'lodash';
import {
	LeaseEvent,
	PropertyEvent,
	TenantEvent,
} from '../event-models/event-models';
import { Cache } from 'cache-manager';
import { EVENTS, EventTemplate } from '../event-models/event-constants';
import { UserDetailsDto } from 'apps/klubiq-dashboard/src/users/dto/org-user.dto';
import { ApiDebugger } from '@app/common/helpers/debug-loggers';
import { Util } from '@app/common/helpers/util';
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
		private readonly apiDebugger: ApiDebugger,
		private readonly util: Util,
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
		const propertyCacheKeys = await this.getPropertyRelatedCacheKeys(
			payload.organizationId,
		);
		const dashboardCacheKeys = await this.getDashboardRelatedCacheKeys(
			payload.organizationId,
		);
		await this.cacheManager.mdel([...propertyCacheKeys, ...dashboardCacheKeys]);
	}

	/**
	 * Invalidates an organization's lease cache
	 * @param payload
	 */
	async invalidateOrganizationLeaseCache(payload: LeaseEvent) {
		const leaseCacheKeys = await this.getLeaseRelatedCacheKeys(
			payload.organizationId,
		);
		const dashboardCacheKeys = await this.getDashboardRelatedCacheKeys(
			payload.organizationId,
		);
		await this.cacheManager.mdel([...leaseCacheKeys, ...dashboardCacheKeys]);
	}

	/**
	 * Invalidates an organization's tenant cache
	 * @param payload
	 */
	async invalidateOrganizationTenantCache(payload: TenantEvent) {
		const dashboardCacheKeys = await this.getDashboardRelatedCacheKeys(
			payload.organizationId,
		);
		const leaseCacheKeys = await this.getLeaseRelatedCacheKeys(
			payload.organizationId,
		);
		const tenantCacheKeys = await this.getTenantRelatedCacheKeys(
			payload.organizationId,
		);
		await this.cacheManager.mdel([
			...dashboardCacheKeys,
			...leaseCacheKeys,
			...tenantCacheKeys,
		]);
	}

	/**
	 * Delete filtered cache by keys
	 * @param keys
	 */
	private async deleteFilteredCacheKeys(keys: string[]) {
		this.apiDebugger.log(keys, 'keys');
		await this.cacheManager.stores[0].deleteMany(keys);
	}

	/**
	 * Get property related cache keys for an organization
	 * @param organizationId
	 * @returns
	 */
	private async getPropertyRelatedCacheKeys(
		organizationId: string,
	): Promise<string[]> {
		const key = this.util.getcacheKey(
			organizationId,
			CacheKeys.PROPERTY,
			'listKeys',
		);
		return await this.cacheManager.get(key);
	}

	/**
	 * Get property related cache keys for an organization
	 * @param organizationId
	 * @returns
	 */
	private async getDashboardRelatedCacheKeys(
		organizationId: string,
	): Promise<string[]> {
		const key = this.util.getcacheKey(
			organizationId,
			CacheKeys.DASHBOARD,
			'listKeys',
		);
		return await this.cacheManager.get(key);
	}

	/**
	 * Get lease related cache keys for an organization
	 * @param organizationId
	 * @returns
	 */
	private async getLeaseRelatedCacheKeys(
		organizationId: string,
	): Promise<string[]> {
		const key = this.util.getcacheKey(
			organizationId,
			CacheKeys.LEASE,
			'listKeys',
		);
		return await this.cacheManager.get(key);
	}

	/**
	 * Get lease related cache keys for an organization
	 * @param organizationId
	 * @returns
	 */
	private async getTenantRelatedCacheKeys(
		organizationId: string,
	): Promise<string[]> {
		const key = this.util.getcacheKey(
			organizationId,
			CacheKeys.TENANT,
			'listKeys',
		);
		return await this.cacheManager.get(key);
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
