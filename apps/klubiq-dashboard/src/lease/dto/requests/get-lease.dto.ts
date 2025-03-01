import { PageOptionsDto } from '@app/common/dto/pagination/page-options.dto';
import { LeaseStatus } from '@app/common/config/config.constants';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum SortProperties {
	START_DATE = 'startDate',
	END_DATE = 'endDate',
	CREATED_DATE = 'createdDate',
	UPDATED_DATE = 'updatedDate',
}

export enum DisplayOptions {
	ALL = 'all',
	ARCHIVED = 'archived',
}

export class LeaseFilterDto {
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
	propertyId?: string;

	@IsOptional()
	unitId?: string;
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

	get skip(): number {
		return (this.page - 1) * this.take;
	}
}
