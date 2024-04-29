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
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
