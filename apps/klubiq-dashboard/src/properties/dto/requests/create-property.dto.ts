import { AutoMap } from '@automapper/classes';
import {
	IsOptional,
	IsArray,
	IsBoolean,
	IsNumber,
	IsString,
	IsNotEmpty,
	IsUrl,
} from 'class-validator';
import { CreateAddressDto } from './create-address.dto';

export class CreatePropertyUnitDto {
	@IsOptional()
	area?: { value?: number; unit?: string };

	@IsOptional()
	@IsNumber()
	bathroom?: number;

	@IsOptional()
	@IsNumber()
	bedroom?: number;

	@IsString()
	name?: string;

	@IsOptional()
	@IsNumber()
	toilet?: number;
}

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

export class ImageDto {
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
}

export class CreatePropertyDto {
	@AutoMap()
	@IsOptional()
	@IsArray()
	@AutoMap(() => [AmenityDto])
	amenities?: AmenityDto[];

	@IsNotEmpty()
	@AutoMap(() => CreateAddressDto)
	address: CreateAddressDto;

	@AutoMap()
	@IsOptional()
	area?: { value?: number; unit?: string };

	@AutoMap()
	@IsOptional()
	@IsNumber()
	bathroom?: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	bedroom?: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	categoryId?: number;

	@AutoMap()
	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsArray()
	@AutoMap(() => [ImageDto])
	images?: ImageDto[];

	@AutoMap()
	@IsOptional()
	@IsBoolean()
	isMultiUnit?: boolean;

	@IsOptional()
	@IsString()
	managerUid?: string;

	@AutoMap()
	@IsOptional()
	@IsString()
	name?: string;

	@AutoMap()
	@IsOptional()
	@IsString()
	note?: string;

	@IsOptional()
	@IsString()
	ownerUid?: string;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	purposeId?: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	statusId?: number;

	@AutoMap()
	@IsOptional()
	@IsArray()
	tags?: string[];

	@AutoMap()
	@IsOptional()
	@IsNumber()
	toilet?: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	typeId?: number;

	@IsOptional()
	units?: CreatePropertyUnitDto[];

	@IsOptional()
	@IsString()
	orgUuid: string;
}
