import {
	CamelCaseNamingConvention,
	Mapper,
	MappingProfile,
	createMap,
	createMapper,
	forMember,
	mapFrom,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
// import { Feature } from '../database/entities/feature.entity';
// import { Permission } from '../database/entities/permission.entity';
// import { FeaturePermission } from '../database/entities/feature-permission.entity';
// import { ViewFeaturePermissionDto } from '../dto/feature-permission.dto';
import { OrganizationRole } from '../database/entities/organization-role.entity';
import { ViewOrgRoleDto } from '../dto/org-role.dto';
import { classes } from '@automapper/classes';

export class CommonProfile extends AutomapperProfile {
	@InjectMapper() customMapper: Mapper;
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper);
		this.customMapper = createMapper({
			strategyInitializer: classes(),
			namingConventions: new CamelCaseNamingConvention(),
		});
	}

	override get profile(): MappingProfile {
		return (customMapper) => {
			// createMap(mapper, Feature, forMember(d => d.name, mapFrom(s => s.name))),
			// createMap(mapper, Permission, forMember(d => d.name, mapFrom(s => s.name))),
			// createMap(customMapper, FeaturePermission, ViewFeaturePermissionDto),
			createMap(
				customMapper,
				OrganizationRole,
				ViewOrgRoleDto,
				forMember(
					(d) => d.permissions,
					mapFrom((s) => s.featurePermissions.map((x) => x.alias)),
				),
			);
		};
	}
}