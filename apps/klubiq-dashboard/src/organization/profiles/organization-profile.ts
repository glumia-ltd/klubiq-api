import { UpdateOrganizationDto } from './../dto/update-organization.dto';
import { Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { OrganizationResponseDto } from '../dto/organization-response.dto';

export class OrganizationProfile extends AutomapperProfile {
	constructor(@InjectMapper('MAPPER') mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(mapper, CreateOrganizationDto, Organization),
				createMap(mapper, Organization, OrganizationResponseDto);
			createMap(mapper, UpdateOrganizationDto, Organization);
		};
	}
}
