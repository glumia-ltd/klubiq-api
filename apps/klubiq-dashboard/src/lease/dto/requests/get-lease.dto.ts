import { PageOptionsDto } from '@app/common/dto/pagination/page-options.dto';
import {
	LeaseStatus,
	PaymentFrequency,
} from '@app/common/config/config.constants';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum SortProperties {
	START_DATE = 'startDate',
	END_DATE = 'endDate',
	CREATED_DATE = 'createdDate',
	LEASE_NAME = 'name',
	STATUS = 'status',
}
export enum DisplayOptions {
	ALL = 'all',
	ARCHIVED = 'archived',
	DRAFT = 'draft',
}

export class LeaseFilterDto {
	@IsOptional()
	@ApiPropertyOptional({
		enum: PaymentFrequency,
		default: PaymentFrequency.MONTHLY,
	})
	@IsEnum(PaymentFrequency)
	paymentFrequency?: PaymentFrequency;

	@IsOptional()
	@ApiPropertyOptional({
		enum: DisplayOptions,
		default: DisplayOptions.ALL,
	})
	@IsEnum(DisplayOptions)
	display?: DisplayOptions;

	@IsOptional()
	@ApiPropertyOptional({
		enum: LeaseStatus,
		default: LeaseStatus.ACTIVE,
	})
	@IsEnum(LeaseStatus)
	status?: LeaseStatus;

	@IsOptional()
	search?: string;
}

export class GetLeaseDto extends IntersectionType(
	LeaseFilterDto,
	PageOptionsDto,
) {
	@IsOptional()
	@ApiPropertyOptional({
		enum: SortProperties,
		default: SortProperties.CREATED_DATE,
	})
	@IsEnum(SortProperties)
	sortBy?: SortProperties;
}
