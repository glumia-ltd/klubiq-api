import { UpdateOrganizationDto } from '../dto/requests/update-organization.dto';
import { Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Organization } from '@app/common/database/entities/organization.entity';
import { CreateOrganizationDto } from '../dto/requests/create-organization.dto';

export class OrganizationProfile extends AutomapperProfile {
	constructor(@InjectMapper('MAPPER') mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(mapper, CreateOrganizationDto, Organization),
				createMap(mapper, UpdateOrganizationDto, Organization);
		};
	}
}
