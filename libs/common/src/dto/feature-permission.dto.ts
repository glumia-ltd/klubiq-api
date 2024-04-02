import { AutoMap } from '@automapper/classes';
import { MapperPickType } from '@automapper/classes/mapped-types';

import { ApiProperty } from '@nestjs/swagger';
import { Feature } from '../database/entities/feature.entity';
import { Permission } from '../database/entities/permission.entity';

export class ViewFeaturePermissionDto {
	@AutoMap()
	@ApiProperty()
	featureName: string;

	@AutoMap()
	@ApiProperty()
	permissionName: string;

	@AutoMap()
	@ApiProperty()
	alias!: string;

	// @AutoMap(() => Permission)
	// permission?: Permission;

	// @AutoMap(() => Feature)
	// feature?: Feature;
}

export class ViewFeatureDto extends MapperPickType(Feature, ['name']) {}

export class ViewPermissionDto extends MapperPickType(Permission, ['name']) {}
