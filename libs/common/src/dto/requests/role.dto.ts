import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class CreateRoleDto {
	@AutoMap()
	@ApiProperty()
	@IsString()
	name: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	description?: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	alias?: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class CreateRoleFeaturePermission extends CreateRoleDto {
	@AutoMap()
	@ApiProperty()
	featurePermissionIds?: number[];
}

export class UpdateRoleFeaturePermissionDto extends PartialType(CreateRoleDto) {
	@AutoMap()
	@ApiProperty()
	oldFeaturePermissionIds?: number[];

	@AutoMap()
	@ApiProperty()
	newFeaturePermissionIds?: number[];
}
