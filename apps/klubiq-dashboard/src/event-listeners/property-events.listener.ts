import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreatePropertyEvent } from './event-models/property-event';
import { DashboardService } from '../dashboard/services/dashboard.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { each } from 'lodash';

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
		each(propertyListKeys, async (key) => {
			await this.cacheManager.del(key);
		});
	}
}
