import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto, PropertyImageDto } from './create-property.dto';
import {
	IsString,
	IsNumber,
	IsJSON,
	IsOptional,
	IsArray,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UnitStatus } from '@app/common/config/config.constants';

export class UpdateUnitDto {
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsString()
	@IsOptional()
	unitNumber: string;

	@IsNumber()
	@IsOptional()
	rentAmount: number;

	@IsNumber()
	@IsOptional()
	floor: number;

	@IsNumber()
	@IsOptional()
	bedrooms: number;

	@IsNumber()
	@IsOptional()
	rooms: number;

	@IsNumber()
	@IsOptional()
	offices: number;

	@IsNumber()
	@IsOptional()
	bathrooms: number;

	@IsNumber()
	@IsOptional()
	toilets: number;

	@IsJSON()
	@IsOptional()
	area: { value: number; unit: string };

	@IsString()
	@IsOptional()
	status: UnitStatus;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => PropertyImageDto)
	images?: PropertyImageDto[];
}
export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateUnitDto)
	units?: UpdateUnitDto[];
}
