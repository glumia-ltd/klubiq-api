import { AutoMap } from '@automapper/classes';
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

export class AmenityDto {
	@AutoMap()
	@IsOptional()
	@IsNumber()
	id?: number;

	@AutoMap()
	@IsOptional()
	@IsString()
	name?: string;
}

export class PropertyImageDto {
	@AutoMap()
	@IsBoolean()
	@IsNotEmpty()
	isMain: boolean;

	@AutoMap()
	@IsNumber()
	@IsNotEmpty()
	fileSize: number;

	@AutoMap()
	@IsUrl()
	@IsNotEmpty()
	url: string;

	@AutoMap()
	@IsString()
	@IsOptional()
	unitNumber?: string;
}

export class CreatePropertyDto {
	@AutoMap()
	@IsOptional()
	@IsArray()
	@AutoMap(() => [AmenityDto])
	amenities?: AmenityDto[];

	@ValidateNested()
	@Type(() => CreateAddressDto)
	address: CreateAddressDto;

	@AutoMap()
	@IsOptional()
	area?: { value?: number; unit?: string };

	@AutoMap()
	@IsNotEmpty()
	@IsNumber()
	categoryId: number;

	@AutoMap()
	@IsOptional()
	@IsString()
	description?: string;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => PropertyImageDto)
	images?: PropertyImageDto[];

	@AutoMap()
	@IsOptional()
	@IsBoolean()
	isMultiUnit?: boolean;

	@IsOptional()
	@IsString()
	managerUid?: string;

	@AutoMap()
	@IsNotEmpty()
	@IsString()
	name: string;

	@AutoMap()
	@IsOptional()
	@IsString()
	note?: string;

	@IsOptional()
	@IsString()
	ownerUid?: string;

	@AutoMap()
	@IsNotEmpty()
	@IsNumber()
	purposeId: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	statusId?: number;

	@AutoMap()
	@IsOptional()
	@IsArray()
	tags?: string[];

	@AutoMap()
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
