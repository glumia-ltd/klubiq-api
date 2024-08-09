import {
	CamelCaseNamingConvention,
	Mapper,
	MappingProfile,
	createMap,
	createMapper,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
// import { Feature } from '../database/entities/feature.entity';
// import { Permission } from '../database/entities/permission.entity';
// import { FeaturePermission } from '../database/entities/feature-permission.entity';
// import { ViewFeaturePermissionDto } from '../dto/feature-permission.dto';
import { OrganizationRole } from '../database/entities/organization-role.entity';
import {
	OrgRoleResponseDto,
	ViewSystemRoleDto,
} from '../dto/responses/org-role.dto';
import { classes } from '@automapper/classes';
import { Feature } from '../database/entities/feature.entity';
import { ViewFeatureDto } from '../dto/responses/feature-response.dto';
import {
	ViewFeaturePermissionDto,
	ViewPermissionDto,
} from '../dto/responses/feature-permission.dto';
import { Permission } from '../database/entities/permission.entity';
import { FeaturePermission } from '../database/entities/feature-permission.entity';
import { Role } from '../database/entities/role.entity';
import { TenantDto } from '../dto/responses/tenant.dto';
import { TenantUser } from '../database/entities/tenant.entity';

export const publicProfile: MappingProfile = (mapper) => {
	createMap(mapper, TenantUser, TenantDto);
};
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
			createMap(customMapper, FeaturePermission, ViewFeaturePermissionDto);
			createMap(customMapper, Role, ViewSystemRoleDto);
			createMap(customMapper, OrganizationRole, OrgRoleResponseDto);
		};
	}
}
