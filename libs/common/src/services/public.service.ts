import { Inject, Injectable, Logger } from '@nestjs/common';

import { PropertyDetailsDto } from 'apps/klubiq-dashboard/src/properties/dto/responses/property-details.dto';

import { PropertiesService } from 'apps/klubiq-dashboard/src/properties/services/properties.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PublicService {
	private readonly logger = new Logger(PublicService.name);
	constructor(
		private propertiesService: PropertiesService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async getOrganizationPropertiesViewList(): Promise<PropertyDetailsDto[]> {
		const properties =
			await this.propertiesService.getPropertyGroupedUnitsByOrganization();
		return properties;
	}
	async resetCache() {
		await this.cacheManager.reset();
	}
}
