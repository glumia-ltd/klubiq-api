import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class PropertyMetadataDto {
	@AutoMap()
	@ApiProperty()
	@Expose()
	@IsNumber()
	id: number;

	@AutoMap()
	@ApiProperty()
	@Expose()
	@IsString()
	name: string;

	@AutoMap()
	@ApiProperty()
	@Expose()
	@IsString()
	displayText: string;

	@Expose()
	metaData: Record<string, any>;
}
