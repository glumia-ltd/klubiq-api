import { Expose, Type } from 'class-transformer';
import {
	IsOptional,
	IsString,
	IsNumber,
	IsBoolean,
	ValidateNested,
	IsArray,
	IsObject,
} from 'class-validator';
import {
	PropertyAddressDto,
	PropertyImageResponseDto,
	PropertyListMetadataDto,
} from './property-list-response.dto';
import {
	LeaseDto,
	LeaseListTenantDto,
} from '../../../lease/dto/responses/view-lease.dto';

//GROUPS :
// Private - means only exposed for property details page
export class UnitDto {
	@Expose()
	@IsNumber()
	id: number;

	@Expose({ groups: ['private'] })
	@IsNumber()
	@IsOptional()
	rooms?: number;

	@Expose({ groups: ['private'] })
	@IsNumber()
	@IsOptional()
	offices?: number;

	@Expose()
	@IsString()
	unitNumber: string;

	@Expose({ groups: ['private'] })
	@IsNumber()
	@IsOptional()
	floor?: number;

	@Expose({ groups: ['private'] })
	@IsNumber()
	@IsOptional()
	bedrooms?: number;

	@Expose({ groups: ['private'] })
	@IsNumber()
	@IsOptional()
	bathrooms?: number;

	@Expose({ groups: ['private'] })
	@IsNumber()
	@IsOptional()
	toilets?: number;

	@Expose({ groups: ['private'] })
	@IsOptional()
	@IsObject()
	area: { value: number; unit: string };

	@Expose({ groups: ['private'] })
	@IsNumber()
	@IsOptional()
	rentAmount?: number;

	@Expose({ groups: ['private'] })
	@IsNumber()
	@IsOptional()
	totalTenants?: number;

	// @Expose({ groups: ['private'] })
	// @ValidateNested({ each: true })
	// @Type(() => LeaseDto)
	// leases?: LeaseDto[];

	@Expose({ groups: ['private'] })
	@ValidateNested({ each: true })
	@Type(() => LeaseDto)
	lease?: LeaseDto;

	@Expose({ groups: ['private'] })
	@ValidateNested({ each: true })
	@Type(() => PropertyImageResponseDto)
	images?: PropertyImageResponseDto[];

	@Expose({ groups: ['private'] })
	@IsArray()
	@IsOptional()
	amenities?: string[];

	@Expose({ groups: ['private'] })
	@ValidateNested({ each: true })
	@Type(() => LeaseListTenantDto)
	tenants?: LeaseListTenantDto[];
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
	profileUuid: string;

	@Expose()
	@IsString()
	firstName: string;

	@Expose()
	@IsString()
	lastName: string;
}

export class PropertyDetailsDto {
	@Expose()
	@IsString()
	name: string;

	@Expose({ groups: ['private'] })
	@ValidateNested()
	@Type(() => PropertyAddressDto)
	address: PropertyAddressDto;

	@Expose({ groups: ['private'] })
	@IsNumber()
	id: number;

	@Expose()
	@IsString()
	uuid: string;

	@Expose({ groups: ['private'] })
	@IsOptional()
	@IsObject()
	area?: { value: number; unit: string };

	@Expose({ groups: ['private'] })
	@ValidateNested({ each: true })
	@Type(() => PropertyImageResponseDto)
	images: PropertyImageResponseDto[];

	@Expose({ groups: ['private'] })
	@IsNumber()
	totalRent: number;

	@Expose({ groups: ['private'] })
	@IsNumber()
	totalTenants: number;

	@Expose({ groups: ['private'] })
	@IsNumber()
	unitCount: number;

	@Expose({ groups: ['private'] })
	@ValidateNested()
	@Type(() => PropertyListMetadataDto)
	type: PropertyListMetadataDto;

	@Expose({ groups: ['private'] })
	@ValidateNested()
	@Type(() => PropertyListMetadataDto)
	purpose: PropertyListMetadataDto;

	@Expose({ groups: ['private'] })
	@ValidateNested()
	@Type(() => PropertyListMetadataDto)
	status: PropertyListMetadataDto;

	@Expose({ groups: ['private'] })
	@ValidateNested()
	@Type(() => PropertyListMetadataDto)
	category: PropertyListMetadataDto;

	@Expose({ groups: ['private'] })
	@ValidateNested()
	@Type(() => PropertyManagerDto)
	manager: PropertyManagerDto;

	@Expose({ groups: ['private'] })
	@ValidateNested()
	@Type(() => PropertyManagerDto)
	owner: PropertyManagerDto;

	@Expose({ groups: ['private'] })
	@IsArray()
	amenities: string[];

	@Expose({ groups: ['private'] })
	@IsOptional()
	@IsString()
	description?: string;

	@Expose({ groups: ['private'] })
	@IsOptional()
	@IsString()
	note?: string;

	@Expose({ groups: ['private'] })
	@IsOptional()
	@IsString({ each: true })
	tags?: string[];

	@Expose({ groups: ['private'] })
	@IsNumber()
	vacantUnitCount: number;

	@Expose({ groups: ['private'] })
	@IsNumber()
	tenantCount: number;

	@Expose({ groups: ['private'] })
	@IsOptional()
	@IsNumber()
	bedrooms?: number;

	@Expose({ groups: ['private'] })
	@IsOptional()
	@IsNumber()
	bathrooms?: number;

	@Expose({ groups: ['private'] })
	@IsOptional()
	@IsNumber()
	toilets?: number;

	@Expose({ groups: ['private'] })
	@IsBoolean()
	isMultiUnit: boolean;

	@Expose({ groups: ['private'] })
	@IsBoolean()
	isArchived: boolean;

	@Expose({ groups: ['private'] })
	@IsBoolean()
	isDraft: boolean;

	@Expose({ groups: ['private'] })
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

	@Expose({ groups: ['private'] })
	@IsBoolean()
	@IsOptional()
	isListingPublished?: boolean;
}
