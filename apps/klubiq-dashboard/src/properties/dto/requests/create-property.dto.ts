import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional } from '@nestjs/swagger';
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

	@ApiPropertyOptional()
	@IsOptional()
	units?: CreatePropertyUnitDto[];

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	isMultiUnit?: boolean;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	bedroom?: number;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	bathroom?: number;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	toilet?: number;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
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

	@IsNotEmpty()
	@AutoMap(() => CreateAddressDto)
	address: CreateAddressDto;

	@ApiPropertyOptional()
	@IsOptional()
	@IsArray()
	@AutoMap(() => [ImageDto])
	images?: ImageDto[];

	@ApiPropertyOptional()
	@IsOptional()
	@IsArray()
	@AutoMap(() => [AmenityDto])
	amenities?: AmenityDto[];

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@AutoMap()
	ownerOrganizationUserUuid?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@AutoMap()
	managerOrganizationUserUuid?: string;
}

export class ImageDto {
	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	url?: string;
}

export class AmenityDto {
	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	id?: number;

	@AutoMap()
	@ApiPropertyOptional()
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
