import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class CreatePermissionDto {
	@AutoMap()
	@ApiProperty({
		description: "Permission's name",
		example: 'App Permission',
	})
	@IsString()
	name: string;

	@AutoMap()
	@ApiProperty({
		description: 'the description of the Permission',
		example: 'app Permission',
	})
	@IsString()
	description?: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	alias?: string;
}

export class CreateFeaturePermissionDto {
	@AutoMap()
	@ApiProperty({
		description: 'Permission id',
	})
	@IsInt()
	@IsNotEmpty()
	permissionId: number;

	@AutoMap()
	@ApiProperty({
		description: 'feature id',
	})
	@IsInt()
	@IsNotEmpty()
	featureId: number;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
export class UpdateFeaturePermissionDto extends PartialType(
	CreateFeaturePermissionDto,
) {}

export class CreateRoleFeaturePermissionDto {
	@IsInt()
	@IsNotEmpty()
	roleId: number;

	@IsInt()
	@IsNotEmpty()
	featurePermissionId: number;

	@IsInt()
	@IsNotEmpty()
	featureId: number;

	@IsInt()
	@IsNotEmpty()
	permissionId: number;
}
