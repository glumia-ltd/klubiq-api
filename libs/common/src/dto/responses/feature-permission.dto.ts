import { AutoMap } from '@automapper/classes';
import { MapperPickType } from '@automapper/classes/mapped-types';

import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../database/entities/permission.entity';
import { ViewFeatureDto } from './feature-response.dto';

export class ViewPermissionDto extends MapperPickType(Permission, [
	'id',
	'name',
	'alias',
	'description',
]) {}

export class ViewFeaturePermissionDto {
	@AutoMap()
	@ApiProperty()
	featurePermissionId!: number;

	@AutoMap()
	@ApiProperty()
	alias!: string;

	@AutoMap()
	@ApiProperty()
	description: string;

	@AutoMap(() => ViewPermissionDto)
	permission?: ViewPermissionDto;

	@AutoMap(() => ViewFeatureDto)
	feature?: ViewFeatureDto;
}
