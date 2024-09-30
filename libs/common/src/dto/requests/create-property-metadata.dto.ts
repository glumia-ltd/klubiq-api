import { AutoMap } from '@automapper/classes';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

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
		type: 'object',
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
	@IsObject()
	metaData: Record<string, any>;
}

export class UpdatePropertyMetadataDto extends PartialType(
	CreatePropertyMetadataDto,
) {}
