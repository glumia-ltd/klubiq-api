import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreatePropertyEvent } from './event-models/property-event';
import { DashboardService } from '../dashboard/services/dashboard.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { each } from 'lodash';
import { CacheKeys } from '@app/common/config/config.constants';

@Injectable()
export class PropertyCreatedListener {
	constructor(
		private readonly dashboardService: DashboardService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}
	@OnEvent('property.created')
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async handlePropertyCreatedEvent(payload: CreatePropertyEvent) {
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
}
