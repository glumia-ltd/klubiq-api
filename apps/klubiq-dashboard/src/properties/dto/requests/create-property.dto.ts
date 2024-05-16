import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsArray,
	IsBoolean,
	IsNumber,
	IsString,
} from 'class-validator';
import { CreateAddressDto } from './create-address.dto';

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

	@AutoMap(() => CreateAddressDto)
	address: CreateAddressDto;

	@ApiPropertyOptional()
	@IsOptional()
	@IsArray()
	@AutoMap(() => [ImagesDto])
	images?: ImagesDto[];

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

export class ImagesDto {
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
	@IsString()
	name?: string;
}
