import {
	CamelCaseNamingConvention,
	Mapper,
	MappingProfile,
	createMap,
	createMapper,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { OrganizationRole } from '../database/entities/organization-role.entity';
import { OrgRoleResponseDto } from '../dto/responses/org-role.dto';
import { classes } from '@automapper/classes';
import { Feature } from '../database/entities/feature.entity';
import { ViewFeatureDto } from '../dto/responses/feature-response.dto';
import { ViewPermissionDto } from '../dto/responses/feature-permission.dto';
import { Permission } from '../database/entities/permission.entity';

export class CommonProfile extends AutomapperProfile {
	@InjectMapper('MAPPER') customMapper: Mapper;
	constructor(@InjectMapper('MAPPER') mapper: Mapper) {
		super(mapper);
		this.customMapper = createMapper({
			strategyInitializer: classes(),
			namingConventions: new CamelCaseNamingConvention(),
		});
	}
	override get profile(): MappingProfile {
		return (customMapper) => {
			createMap(customMapper, Feature, ViewFeatureDto);
			createMap(customMapper, Permission, ViewPermissionDto);
			createMap(customMapper, OrganizationRole, OrgRoleResponseDto);
		};
	}
}
