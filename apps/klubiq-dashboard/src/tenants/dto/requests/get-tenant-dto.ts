import { PageOptionsDto } from '@app/common/dto/pagination/page-options.dto';
import { IsOptional } from 'class-validator';
import { IntersectionType } from '@nestjs/swagger';

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
