import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
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
		description: 'Feature Permission Alias',
		example: 'permission_feature_access',
	})
	@IsString()
	alias?: string;

	@AutoMap()
	@ApiProperty({
		description: 'Feature Permission description',
	})
	@IsString()
	description?: string;

	@AutoMap()
	@ApiProperty({
		description: 'Permission id',
	})
	@IsString()
	permissionId: number;

	@AutoMap()
	@ApiProperty({
		description: 'Permission id',
	})
	@IsString()
	featureId: number;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
export class UpdateFeaturePermissionDto extends PartialType(
	CreateFeaturePermissionDto,
) {}
