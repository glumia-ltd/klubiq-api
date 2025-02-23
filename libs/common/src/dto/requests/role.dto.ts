import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString, IsUUID } from 'class-validator';
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

	@AutoMap()
	@ApiProperty()
	@IsUUID()
	organizationUuid?: string;

	@ApiProperty()
	@IsBoolean()
	isKlubiqInternal?: boolean;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class CreateRoleFeaturePermission extends CreateRoleDto {
	@AutoMap()
	@ApiProperty()
	featurePermissionIds?: number[];
}

export class UpdateRoleFeaturePermissionDto {
	@AutoMap()
	@ApiProperty()
	@IsArray()
	oldFeaturePermissionIds: number[];

	@AutoMap()
	@ApiProperty()
	@IsArray()
	newFeaturePermissionIds: number[];

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
