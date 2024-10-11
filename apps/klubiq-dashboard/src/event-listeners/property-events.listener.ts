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
		const propertyListKeys = await this.cacheManager.get<string[]>(
			`${payload.organizationId}/getPropertyListKeys`,
		);
		const propertyMetricsKey = `dashboard/${CacheKeys.PROPERTY_METRICS}/${payload.organizationId}`;
		const propertyMetricsCache =
			await this.cacheManager.get(propertyMetricsKey);
		each(propertyListKeys, async (key) => {
			await this.cacheManager.del(key);
		});
		if (propertyMetricsCache) {
			await this.cacheManager.del(propertyMetricsKey);
		}
	}
}
