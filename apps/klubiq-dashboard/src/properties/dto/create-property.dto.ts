import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsArray,
	IsBoolean,
	IsNumber,
	IsString,
	IsJSON,
} from 'class-validator';

export class CreatePropertyDto {
	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	name: string;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	description?: string;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	note?: string;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsArray()
	tags?: string[];

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	isMultiUnit?: boolean;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	bedrooms?: number;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	bathrooms?: number;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsJSON()
	area?: { value?: number; unit?: string };

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	categoryId?: number;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	typeId?: number;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	purposeId?: number;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	statusId?: number;
}
