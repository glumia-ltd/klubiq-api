import { Expose, Type } from 'class-transformer';

export class TenantDto {
	@Expose() id: string;
	@Expose() fullName: string;
	@Expose() email: string;
	@Expose() phone?: string;
}

export class LeaseDto {
	@Expose() id: string;
	@Expose() leaseStart: Date;
	@Expose() leaseEnd: Date;
	@Expose() rentAmount: number;
	@Expose() unitId?: string;
}

export class LeaseTenantResponseDto {
	@Expose() id: string;
	@Expose() isPrimaryTenant: boolean;

	@Expose()
	@Type(() => TenantDto)
	tenant: TenantDto;

	@Expose()
	@Type(() => LeaseDto)
	lease: LeaseDto;
}
