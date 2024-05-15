import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsNumber, IsString } from 'class-validator';

export class PropertyMetadataDto {
	@AutoMap()
	@ApiProperty()
	@IsNumber()
	id: number;

	@AutoMap()
	@ApiProperty()
	@IsString()
	name: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	displayText: string;
}
