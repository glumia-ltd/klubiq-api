import { UnitStatus } from '@app/common/config/config.constants';
import {
	IsString,
	IsNumber,
	IsOptional,
	IsArray,
	ValidateNested,
	IsObject,
} from 'class-validator';
import { PropertyImageDto } from './create-property.dto';
import { Type } from 'class-transformer';

export class CreateUnitDto {
	@IsNumber()
	@IsOptional()
	id?: string;

	@IsString()
	@IsOptional()
	unitNumber?: string;

	@IsNumber()
	@IsOptional()
	rentAmount?: number;

	@IsNumber()
	@IsOptional()
	floor?: number;

	@IsNumber()
	@IsOptional()
	bedrooms?: number;

	@IsNumber()
	@IsOptional()
	bathrooms?: number;

	@IsNumber()
	@IsOptional()
	toilets?: number;

	@IsObject()
	area: { value: number; unit: string };

	@IsString()
	@IsOptional()
	status?: UnitStatus;

	@IsNumber()
	@IsOptional()
	rooms?: number;

	@IsNumber()
	@IsOptional()
	offices?: number;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => PropertyImageDto)
	images?: PropertyImageDto[];

	@IsArray()
	@IsOptional()
	amenities?: string[];
}
