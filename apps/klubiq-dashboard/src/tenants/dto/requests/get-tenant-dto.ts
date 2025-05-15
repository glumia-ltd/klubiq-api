import { PageOptionsDto } from '@app/common/dto/pagination/page-options.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum SortTenants {
	CREATED_DATE = 'createdDate',
	UPDATED_DATE = 'updatedDate',
}
export class TenantFilterDto {
	@IsOptional()
	@ApiPropertyOptional({
		enum: SortTenants,
		default: SortTenants.CREATED_DATE,
	})
	@IsEnum(SortTenants)
	sortBy?: SortTenants;

	@IsOptional()
	search?: string;

	@IsOptional()
	tenantId?: string;
}
export class GetTenantDto extends IntersectionType(
	TenantFilterDto,
	PageOptionsDto,
) {
	get skip(): number {
		return (this.page - 1) * this.take;
	}
}

export class TenantListDto {
	@Expose()
	id: string;

	@Expose()
	profileUuid: string;

	@Expose()
	companyName: string;

	@Expose()
	fullName: string;

	@Expose()
	activeLeaseCount: number;

	@Expose()
	mostRecentLeaseStartDate: Date;

	@Expose()
	mostRecentLeaseId: string;

	@Expose()
	mostRecentUnitId: string;

	@Expose()
	mostRecentUnitName: string;

	@Expose()
	mostRecentPropertyId: string;

	@Expose()
	mostRecentPropertyName: string;

	@Expose()
	mostRecentPaymentStatus: string | null;

	@Expose()
	createdDate: Date | null;

	@Expose()
	updatedDate: Date | null;
}
