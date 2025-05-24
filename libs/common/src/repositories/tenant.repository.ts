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
			.createQueryBuilder(OrganizationTenants, 'orgtenants')
			.innerJoin('orgtenants.tenant', 'tenant')
			.leftJoin('tenant.profile', 'profile')
			.select([
				'orgtenants.tenantId',
				'tenant.id',
				'tenant.companyName',
				'profile.firstName',
				'profile.lastName',
				'profile.email',
				'profile.title',
			])
			.where('orgtenants.organizationUuid = :orgUuid', { orgUuid })
			.andWhere('tenant.isActive = :isActive', { isActive: true })
			.getMany();
		console.log('userData', userData);
		return userData;
	}
}
