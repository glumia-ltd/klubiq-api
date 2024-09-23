import {
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class PropertyListMetadataDto {
	@Expose()
	@IsNumber()
	id: number;

	@Expose()
	@IsString()
	name: string;

	@Expose()
	@IsString()
	displayText: string;
}

export class PropertyAddressDto {
	@Expose()
	@IsString()
	addressLine1: string;

	@Expose()
	@IsString()
	@IsOptional()
	unit?: string;

	@Expose()
	@IsString()
	@IsOptional()
	addressLine2?: string;

	@Expose()
	@IsString()
	@IsOptional()
	city?: string;

	@Expose()
	@IsString()
	@IsOptional()
	state?: string;

	@Expose()
	@IsString()
	@IsOptional()
	postalCode?: string;

	@Expose()
	@IsString()
	country: string;
}

export class PropertyImageResponseDto {
	@Expose()
	@IsString()
	url: string;

	@Expose()
	@IsBoolean()
	isMain: boolean;
}

export class PropertyListDto {
	@Expose()
	@IsString()
	uuid: string;

	@Expose()
	@IsNumber()
	id: number;

	@Expose()
	@IsString()
	name: string;

	@Expose()
	@ValidateNested()
	@Type(() => PropertyListMetadataDto)
	type: PropertyListMetadataDto;

	@Expose()
	@ValidateNested()
	@Type(() => PropertyListMetadataDto)
	purpose: PropertyListMetadataDto;

	@Expose()
	@ValidateNested()
	@Type(() => PropertyAddressDto)
	address: PropertyAddressDto;

	@Expose()
	@IsOptional()
	@IsNumber()
	bedrooms?: number;

	@Expose()
	@IsNumber()
	@IsOptional()
	rooms?: number;

	@Expose()
	@IsNumber()
	@IsOptional()
	offices?: number;

	@Expose()
	@IsNumber()
	@IsOptional()
	floor?: number;

	@Expose()
	@IsOptional()
	@IsNumber()
	bathrooms?: number;

	@Expose()
	@IsOptional()
	@IsNumber()
	toilets?: number;

	@Expose()
	@IsOptional()
	@ValidateNested()
	area?: { value: number; unit: string };

	@Expose()
	@IsNumber()
	unitCount: number;

	@Expose()
	@IsBoolean()
	isMultiUnit: boolean;

	@Expose()
	@ValidateNested()
	@Type(() => PropertyImageResponseDto)
	mainImage: PropertyImageResponseDto;

	@Expose()
	@IsBoolean()
	isDraft: boolean;
}
