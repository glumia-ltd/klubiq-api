import {
	IsArray,
	IsBoolean,
	IsDate,
	IsEnum,
	IsNumber,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import {
	LeaseStatus,
	PaymentFrequency,
} from '@app/common/config/config.constants';

export class PropertyLeaseMetrics {
	totalRent: number;
	totalTenants: number;
	unitLeaseCount: number;
	occupiedUnitCount: number;
	propertyLeaseCount: number;
}
export class TenantProfileDto {
	@Expose()
	@IsString()
	firstName: string;

	@Expose()
	@IsString()
	lastName: string;

	@Expose()
	@IsString()
	email: string;

	@Expose()
	@IsString()
	profileUuid: string;

	@Expose()
	@IsString()
	profilePicUrl: string;

	@Expose()
	@IsString()
	phoneNumber: string;
}

export class LeaseListTenantDto {
	@Expose()
	@IsString()
	id: string | number;

	@Expose()
	@ValidateNested()
	@Type(() => TenantProfileDto)
	profile: TenantProfileDto;

	@Expose()
	@IsBoolean()
	isPrimaryTenant: boolean;
}
export class LeaseListPropertyDto {
	@Expose()
	@IsString()
	name: string;

	@Expose()
	@IsString()
	managerUid: string;

	@Expose()
	@IsString()
	ownerUid: string;

	@Expose()
	@IsString()
	uuid: string;
}
export class LeaseDto {
	@Expose()
	@IsNumber()
	id: string;

	@Expose()
	@IsString()
	unitNumber: string;

	@Expose()
	@IsString()
	unitId: string;

	@Expose()
	@IsEnum(() => LeaseStatus)
	status?: LeaseStatus;

	@Expose()
	@IsNumber()
	rentAmount: number;

	@Expose()
	@IsDate()
	startDate?: Date;

	@Expose()
	@IsDate()
	endDate?: Date;

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => LeaseListTenantDto)
	tenants: LeaseListTenantDto[];

	@Expose()
	@ValidateNested()
	@Type(() => LeaseListPropertyDto)
	property: LeaseListPropertyDto;
}

export class LeaseDetailsDto {
	@Expose()
	@IsString()
	id: string;

	@Expose()
	@IsString()
	unitNumber: string;

	@Expose()
	@IsString()
	propertyName: string;

	@Expose()
	@IsString()
	propertyAddress: string;

	@Expose()
	@IsString()
	propertyType: string;

	@Expose()
	@IsBoolean()
	isMultiUnitProperty: boolean;

	@Expose()
	@IsNumber()
	rentAmount: number;

	@Expose()
	@IsEnum(() => PaymentFrequency)
	paymentFrequency: PaymentFrequency;

	@Expose()
	@IsNumber()
	rentDueDay: number;

	@Expose()
	@IsDate()
	rentDueOn: Date;

	@Expose()
	@IsDate()
	nextPaymentDate: Date;

	@Expose()
	@IsDate()
	startDate?: Date;

	@Expose()
	@IsDate()
	endDate?: Date;

	@Expose()
	@IsEnum(() => LeaseStatus)
	status?: LeaseStatus;

	@Expose()
	@IsArray()
	@Type(() => LeaseListTenantDto)
	tenants: LeaseListTenantDto[];

	@Expose()
	@IsNumber()
	daysToLeaseExpires: number;
}
