import { PageOptionsDto } from '@app/common/dto/pagination/page-options.dto';
//import { IntersectionType } from "@nestjs/mapped-types"
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { IntersectionType } from '@nestjs/swagger';

export enum SortProperties {
	UPDATED_DATE = 'updatedDate',
	CREATED_DATE = 'createdDate',
	PROPERTY_NAME = 'name',
}

export class PropertyFilterDto {
	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	isArchived?: boolean;

	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	isMultiUnit?: boolean;

	@IsOptional()
	@Type(() => Number)
	statusId?: number;

	@IsOptional()
	@Type(() => Number)
	typeId?: number;

	@IsOptional()
	@Type(() => Number)
	purposeId?: number;

	@IsOptional()
	search?: string;
}
export class GetPropertyDto extends IntersectionType(
	PropertyFilterDto,
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
