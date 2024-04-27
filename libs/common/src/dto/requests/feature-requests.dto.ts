import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class CreateFeatureDto {
	@AutoMap()
	@ApiProperty({
		description: "Feature's name",
		example: 'App Feature',
	})
	@IsString()
	name: string;

	@AutoMap()
	@ApiProperty({
		description: "Feature's alias",
		example: 'Feature-alias',
	})
	@IsString()
	alias: string;

	@AutoMap()
	@ApiProperty({
		description: 'the description of the feature',
		example: 'feature for app',
	})
	@IsString()
	description?: string;
}

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
