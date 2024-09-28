import { AutoMap } from '@automapper/classes';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class CreatePropertyMetadataDto {
	@AutoMap()
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	name: string;

	@AutoMap()
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	displayText: string;

	@ApiProperty({
		type: 'json',
		example: {
			iconName: 'value',
			hasRooms: true,
			hasBedrooms: true,
			hasBathrooms: true,
			hasToilets: true,
			hasOffices: true,
		},
	})
	@IsNotEmpty()
	@IsJSON()
	metaData: Record<string, any>;
}

export class UpdatePropertyMetadataDto extends PartialType(
	CreatePropertyMetadataDto,
) {}
