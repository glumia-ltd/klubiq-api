import { Injectable, Logger } from '@nestjs/common';

import { PropertyDetailsDto } from 'apps/klubiq-dashboard/src/properties/dto/responses/property-details.dto';

import { PropertiesService } from 'apps/klubiq-dashboard/src/properties/services/properties.service';

@Injectable()
export class PublicService {
	private readonly logger = new Logger(PublicService.name);
	constructor(private propertiesService: PropertiesService) {}

	async getOrganizationPropertiesViewList(): Promise<PropertyDetailsDto[]> {
		const properties =
			await this.propertiesService.getPropertyGroupedUnitsByOrganization();
		return properties;
	}
}
