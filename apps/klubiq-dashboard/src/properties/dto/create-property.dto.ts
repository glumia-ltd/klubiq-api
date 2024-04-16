import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsOptional,
	IsArray,
	IsBoolean,
	IsNumber,
	IsString,
	IsJSON,
} from 'class-validator';

export class CreatePropertyDto {
	@AutoMap()
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	name: string;

	@AutoMap()
	@ApiProperty()
	@IsOptional()
	@IsString()
	description?: string;

	@AutoMap()
	@ApiProperty()
	@IsOptional()
	@IsString()
	note?: string;

	@AutoMap()
	@ApiProperty()
	@IsOptional()
	@IsArray()
	tags?: string[];

	@AutoMap()
	@ApiProperty()
	@IsNotEmpty()
	@IsBoolean()
	isMultiUnit: boolean;

	@AutoMap()
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	bedrooms: number;

	@AutoMap()
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	bathrooms: number;

	@AutoMap()
	@ApiProperty()
	@IsNotEmpty()
	@IsJSON()
	area: { value: number; unit: string };
}
