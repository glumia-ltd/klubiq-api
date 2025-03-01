import { CreateTenantDto } from '@app/common/dto/requests/create-tenant.dto';
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
	@IsString()
	name: string;

	@IsDateString()
	startDate: string;

	@IsDateString()
	@IsOptional()
	endDate?: string;

	@IsArray()
	@IsOptional()
	newTenants?: CreateTenantDto[];

	@IsArray()
	@IsOptional()
	tenantsIds?: number[];

	@IsNumber()
	unitId: string;

	@IsNumber()
	rentDueDay: number;

	@IsNumber()
	rentAmount: number;

	@IsOptional()
	@IsNumber()
	securityDeposit?: number;

	@IsOptional()
	isDraft?: boolean;

	@IsString()
	@IsEnum(PaymentFrequency)
	paymentFrequency: PaymentFrequency;

	@IsString()
	@IsEnum(LeaseStatus)
	@IsOptional()
	status?: LeaseStatus;

	@IsString()
	propertyName: string;

	@IsString()
	@IsOptional()
	firstPaymentDate?: string;

	@IsString()
	unitNumber: string;
}

export class LeaseTenantsDto {
	@AutoMap()
	@IsString()
	profileUuid: string;
}
