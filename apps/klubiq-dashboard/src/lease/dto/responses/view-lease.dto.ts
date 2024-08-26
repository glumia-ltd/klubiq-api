import { TenantDto } from '@app/common/dto/responses/tenant.dto';
import {
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
export class LeaseDto {
	@Expose()
	@IsNumber()
	id: number;

	@Expose()
	@IsString()
	name?: string;

	@Expose()
	@IsEnum(() => PaymentFrequency)
	paymentFrequency: PaymentFrequency;

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
	@IsNumber()
	rentDueDay?: number;

	@Expose()
	@IsNumber()
	securityDeposit?: number;

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => TenantDto)
	tenants: TenantDto[];

	@Expose()
	@IsBoolean()
	isDraft?: boolean;

	@Expose()
	@IsBoolean()
	isArchived?: boolean;
}
