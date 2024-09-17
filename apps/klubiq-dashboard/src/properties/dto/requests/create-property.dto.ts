import {
	IsOptional,
	IsArray,
	IsBoolean,
	IsNumber,
	IsString,
	IsNotEmpty,
	IsUrl,
	ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from './create-address.dto';
import { CreateUnitDto } from './create-unit.dto';
import { Type } from 'class-transformer';

export class PropertyImageDto {
	@IsBoolean()
	@IsNotEmpty()
	isMain: boolean;

	@IsNumber()
	@IsNotEmpty()
	fileSize: number;

	@IsUrl()
	@IsNotEmpty()
	url: string;

	@IsString()
	@IsOptional()
	unitNumber?: string;

	@IsNumber()
	@IsOptional()
	id?: number;
}

export class CreatePropertyDto {
	@IsOptional()
	@IsArray()
	customAmenities?: string[];

	@ValidateNested()
	@Type(() => CreateAddressDto)
	address: CreateAddressDto;

	@IsNotEmpty()
	@IsNumber()
	categoryId: number;

	@IsOptional()
	@IsString()
	description?: string;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => PropertyImageDto)
	images?: PropertyImageDto[];

	@IsOptional()
	@IsBoolean()
	isMultiUnit?: boolean;

	@IsOptional()
	@IsString()
	managerUid?: string;

	@IsNotEmpty()
	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	note?: string;

	@IsOptional()
	@IsString()
	ownerUid?: string;

	@IsNotEmpty()
	@IsNumber()
	purposeId: number;

	@IsOptional()
	@IsNumber()
	statusId?: number;

	@IsOptional()
	@IsArray()
	tags?: string[];

	@IsNotEmpty()
	@IsNumber()
	typeId: number;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => CreateUnitDto)
	units: CreateUnitDto[];

	@IsString()
	orgUuid: string;
}
