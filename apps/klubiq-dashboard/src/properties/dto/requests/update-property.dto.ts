import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto, PropertyImageDto } from './create-property.dto';
import {
	IsString,
	IsNumber,
	IsOptional,
	IsArray,
	ValidateNested,
	IsObject,
	IsNotEmpty,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
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

	@IsObject()
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

	@IsArray()
	@IsOptional()
	amenities?: string[];
}
export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateUnitDto)
	units?: UpdateUnitDto[];
}

export class DeletePropertyDto {
	@Expose()
	@IsString()
	@IsNotEmpty()
	uuid: string;

	@Expose()
	@IsString()
	address: string;

	@Expose()
	@IsString()
	name: string;

	@Expose()
	@IsNumber()
	unitCount: number;
}
