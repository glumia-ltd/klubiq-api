import { AutoMap } from '@automapper/classes';
import {
	IsOptional,
	IsArray,
	IsBoolean,
	IsNumber,
	IsString,
	IsNotEmpty,
} from 'class-validator';
import { CreateAddressDto } from './create-address.dto';

export class CreatePropertyDto {
	@AutoMap()
	@IsString()
	name: string;

	@AutoMap()
	@IsOptional()
	@IsString()
	description?: string;

	@AutoMap()
	@IsOptional()
	@IsString()
	note?: string;

	@AutoMap()
	@IsOptional()
	@IsArray()
	tags?: string[];

	@IsOptional()
	units?: CreatePropertyUnitDto[];

	@AutoMap()
	@IsOptional()
	@IsBoolean()
	isMultiUnit?: boolean;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	bedroom?: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	bathroom?: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	toilet?: number;

	@AutoMap()
	@IsOptional()
	area?: { value?: number; unit?: string };

	@AutoMap()
	@IsOptional()
	@IsNumber()
	categoryId?: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	typeId?: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	purposeId?: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	statusId?: number;

	@IsNotEmpty()
	@AutoMap(() => CreateAddressDto)
	address: CreateAddressDto;

	@IsOptional()
	@IsArray()
	@AutoMap(() => [ImageDto])
	images?: ImageDto[];

	@IsOptional()
	@IsArray()
	@AutoMap(() => [AmenityDto])
	amenities?: AmenityDto[];

	@IsOptional()
	@IsString()
	ownerUid?: string;

	@IsOptional()
	@IsString()
	managerUid?: string;

	@IsOptional()
	@IsString()
	orgUuid: string;
}

export class ImageDto {
	@AutoMap()
	@IsOptional()
	@IsString()
	url?: string;
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

export class CreatePropertyUnitDto {
	@IsString()
	name: string;

	@IsOptional()
	@IsNumber()
	bedroom?: number;

	@IsOptional()
	@IsNumber()
	bathroom?: number;

	@IsOptional()
	@IsNumber()
	toilet?: number;

	@IsOptional()
	area?: { value?: number; unit?: string };
}
