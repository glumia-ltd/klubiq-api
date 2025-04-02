import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { TenantUser } from '../database/entities/tenant.entity';
import { OrganizationTenants } from '../database/entities/organization-tenants.entity';

@Injectable()
export class TenantRepository extends BaseRepository<TenantUser> {
	protected readonly logger = new Logger(TenantRepository.name);
	constructor(manager: EntityManager) {
		super(TenantUser, manager);
	}

	async getOrganizationTenants(orgUuid: string) {
		const userData = await this.manager
			.createQueryBuilder(OrganizationTenants, 'org_tenants')
			.leftJoin('org_tenants.tenant', 'tenant')
			.select(['tenant.id', 'tenant.isActive', 'tenant.companyName'])
			.where('org_tenants.organizationUuid = :orgUuid', { orgUuid })
			.getMany();
		return userData;
	}
}
