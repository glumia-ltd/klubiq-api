import { Expose, Type } from 'class-transformer';
import {
	IsOptional,
	IsString,
	IsNumber,
	IsBoolean,
	ValidateNested,
	IsJSON,
} from 'class-validator';
import {
	PropertyAddressDto,
	PropertyImageResponseDto,
	PropertyListMetadataDto,
} from './property-list-response.dto';
import { LeaseDto } from '../../../lease/dto/responses/view-lease.dto';

export class UnitDto {
	@Expose()
	@IsNumber()
	id: number;

	@Expose()
	@IsNumber()
	@IsOptional()
	rooms?: number;

	@Expose()
	@IsNumber()
	@IsOptional()
	offices?: number;

	@Expose()
	@IsString()
	unitNumber: string;

	@Expose()
	@IsNumber()
	@IsOptional()
	floor?: number;

	@Expose()
	@IsNumber()
	@IsOptional()
	bedrooms?: number;

	@Expose()
	@IsNumber()
	@IsOptional()
	bathrooms?: number;

	@Expose()
	@IsNumber()
	@IsOptional()
	toilets?: number;

	@Expose()
	@IsOptional()
	@IsJSON()
	area: { value: number; unit: string };

	@Expose()
	@IsNumber()
	@IsOptional()
	rentAmount?: number;

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => LeaseDto)
	leases?: LeaseDto[];

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => PropertyImageResponseDto)
	images?: PropertyImageResponseDto[];
}

export class PropertyManagerDto {
	@Expose()
	@IsString()
	@IsOptional()
	profilePicUrl?: string;

	@Expose()
	@IsString()
	email: string;

	@Expose()
	@IsString()
	firebaseId: string;
}

export class PropertyAmenityDto {
	@Expose()
	@IsString()
	name: string;
}

export class PropertyDetailsDto {
	@Expose()
	@IsString()
	name: string;

	@Expose()
	@ValidateNested()
	@Type(() => PropertyAddressDto)
	address: PropertyAddressDto;

	@Expose()
	@IsNumber()
	id: number;

	@Expose()
	@IsString()
	uuid: string;

	@Expose()
	@IsOptional()
	@IsJSON()
	area?: { value: number; unit: string };

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => PropertyImageResponseDto)
	images: PropertyImageResponseDto[];

	@Expose()
	@IsNumber()
	totalRent: number;

	@Expose()
	@IsNumber()
	unitCount: number;

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
	@Type(() => PropertyListMetadataDto)
	status: PropertyListMetadataDto;

	@Expose()
	@ValidateNested()
	@Type(() => PropertyListMetadataDto)
	category: PropertyListMetadataDto;

	@Expose()
	@ValidateNested()
	@Type(() => PropertyManagerDto)
	manager: PropertyManagerDto;

	@Expose()
	@ValidateNested()
	@Type(() => PropertyManagerDto)
	owner: PropertyManagerDto;

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => PropertyAmenityDto)
	amenities: PropertyAmenityDto[];

	@Expose()
	@IsOptional()
	@IsString()
	description?: string;

	@Expose()
	@IsOptional()
	@IsString()
	note?: string;

	@Expose()
	@IsOptional()
	@IsString({ each: true })
	tags?: string[];

	@Expose()
	@IsNumber()
	vacantUnitCount: number;

	@Expose()
	@IsNumber()
	tenantCount: number;

	@Expose()
	@IsOptional()
	@IsNumber()
	bedrooms?: number;

	@Expose()
	@IsOptional()
	@IsNumber()
	bathrooms?: number;

	@Expose()
	@IsOptional()
	@IsNumber()
	toilets?: number;

	@Expose()
	@IsBoolean()
	isMultiUnit: boolean;

	@Expose()
	@IsBoolean()
	isArchived: boolean;

	@Expose()
	@IsBoolean()
	isDraft: boolean;

	@Expose()
	@IsOptional()
	archivedDate?: Date;

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => UnitDto)
	units: UnitDto[];

	// @Expose()
	// @ValidateNested({ each: true })
	// @Type(() => LeaseDto)
	// leases?: LeaseDto[];

	@Expose()
	@IsBoolean()
	@IsOptional()
	isListingPublished?: boolean;
}
