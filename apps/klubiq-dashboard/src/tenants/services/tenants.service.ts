import { Injectable } from '@nestjs/common';
import { LeaseTenantRepository } from '@app/common/repositories/leases-tenant.repositiory';
import { PageDto, PageMetaDto } from '@app/common';
import { LeaseTenantResponseDto } from '../dto/responses/lease-tenant.dto';
import { GetTenantDto } from '../dto/requests/get-tenant-dto';

@Injectable()
export class TenantsService {
	constructor(private readonly leaseTenantRepository: LeaseTenantRepository) {}

	async findAll(
		getTenantDto?: GetTenantDto,
	): Promise<PageDto<LeaseTenantResponseDto>> {
		const [entities, count] =
			await this.leaseTenantRepository.findAllLeasesTenant(getTenantDto);
		const pageMetaDto = new PageMetaDto({
			itemCount: count,
			pageOptionsDto: getTenantDto,
		});
		const propertiesPageData: any = new PageDto(entities, pageMetaDto);
		return propertiesPageData;
	}

	async findOne(id: string) {
		return this.leaseTenantRepository.getTenantById(id);
	}

	async findByLeaseId(leaseId: string): Promise<LeaseTenantResponseDto[]> {
		return this.leaseTenantRepository.findByLeaseId(leaseId);
	}

	async findByOrganizationId(orgnizationUuid: string) {
		return this.leaseTenantRepository.organizationTenants(orgnizationUuid);
	}
}
