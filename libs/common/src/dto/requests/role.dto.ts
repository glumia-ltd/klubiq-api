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
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class CreateOrgRoleDto {
	@AutoMap()
	@ApiProperty()
	name: string;

	@AutoMap()
	@ApiProperty()
	description?: string;
}

export class UpdateOrgRoleDto extends PartialType(CreateOrgRoleDto) {}
