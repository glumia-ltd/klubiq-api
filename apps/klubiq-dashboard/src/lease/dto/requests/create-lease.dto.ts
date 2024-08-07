import { CreateTenantDto } from '@app/common';
import {
	LeaseStatus,
	PaymentFrequency,
} from '@app/common/config/config.constants';
import { AutoMap } from '@automapper/classes';
import {
	IsArray,
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreateLeaseDto {
	@AutoMap()
	@IsString()
	name: string;

	@AutoMap()
	@IsDateString()
	startDate: string;

	@AutoMap()
	@IsDateString()
	endDate?: string;

	@AutoMap()
	@IsArray()
	@IsOptional()
	tenants?: CreateTenantDto[];

	@AutoMap()
	@IsString()
	propertyUuId: string;

	@AutoMap()
	@IsNumber()
	rentDueDay: number;

	@AutoMap()
	@IsNumber()
	rentAmount: number;

	@AutoMap()
	@IsOptional()
	@IsNumber()
	securityDeposit?: number;

	@AutoMap()
	@IsOptional()
	isDraft?: boolean;

	@AutoMap()
	@IsString()
	@IsEnum(PaymentFrequency)
	paymentFrequency: PaymentFrequency;

	@AutoMap()
	@IsString()
	@IsEnum(LeaseStatus)
	@IsOptional()
	status?: LeaseStatus;
}

export class LeaseTenantsDto {
	@AutoMap()
	@IsString()
	profileUuid: string;
}
