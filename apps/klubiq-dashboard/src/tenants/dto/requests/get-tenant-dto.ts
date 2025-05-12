import { PageOptionsDto } from '@app/common/dto/pagination/page-options.dto';
import { IsOptional } from 'class-validator';
import { IntersectionType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
export class TenantFilterDto {
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
	uuid: string;

	@Expose()
	tenantId: string;

	@Expose()
	organizationUuid: string;

	@Expose()
	companyName: string;

	@Expose()
	isActive: boolean;

	@Expose()
	firstName: string;

	@Expose()
	lastName: string;

	@Expose()
	email: string;

	@Expose()
	phoneNumber: string;

	@Expose()
	isKYCVerified: boolean;

	// Other fields that might be null but should still appear
	@Expose()
	profilePicUrl: string | null;

	@Expose()
	gender: string | null;

	@Expose()
	dateOfBirth: string | null;

	@Expose()
	street: string | null;

	@Expose()
	city: string | null;

	@Expose()
	state: string | null;

	@Expose()
	country: string | null;

	@Expose()
	postalCode: string | null;
}
