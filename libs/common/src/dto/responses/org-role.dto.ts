import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
// import { ViewFeaturePermissionDto, ViewRoleFeaturePermissionDto } from './feature-permission.dto';
import { Role } from '../../database/entities/role.entity';
import { MapperPickType } from '@automapper/classes/mapped-types';
import { ViewFeaturePermissionDto } from './feature-permission.dto';

export class ViewOrgRoleDto {
	@AutoMap()
	@ApiProperty()
	name: string;

	@AutoMap()
	permissions: string[];
}
export class ViewSystemRoleDto extends MapperPickType(Role, [
	'id',
	'name',
	'description',
]) {}

export class OrgRoleResponseDto {
	@AutoMap()
	@ApiProperty()
	id: number;

	@AutoMap()
	@ApiProperty()
	name: string;

	@AutoMap()
	@ApiProperty()
	description?: string;

	@AutoMap(() => [ViewFeaturePermissionDto])
	@ApiProperty()
	featurePermissions: ViewFeaturePermissionDto[];
}
