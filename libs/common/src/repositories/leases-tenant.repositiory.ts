import { Lease } from '../database/entities/lease.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TenantUser } from '../database/entities/tenant.entity';
import { LeasesTenants } from '../database/entities/leases-tenants.entity';

@Injectable()
export class LeaseTenantRepository extends BaseRepository<LeasesTenants> {
	protected readonly logger = new Logger(LeaseTenantRepository.name);

	constructor(manager: EntityManager) {
		super(LeasesTenants, manager);
	}

	async mapTenantToLease(
		tenantId: string,
		leaseId: string,
		isPrimaryTenant: boolean,
		manager: EntityManager = this.manager,
	) {
		if (!tenantId || !leaseId) {
			throw new BadRequestException('Tenant ID and Lease ID must be provided.');
		}

		const tenant = await manager.findOne(TenantUser, {
			where: { id: tenantId },
		});

		if (!tenant) {
			throw new BadRequestException('Tenant not found.');
		}

		const lease = await manager.findOne(Lease, {
			where: { id: leaseId },
		});

		if (!lease) {
			throw new BadRequestException('Lease not found.');
		}

		const leasesTenants = manager.create(LeasesTenants, {
			tenant,
			lease,
			isPrimaryTenant,
		});

		return manager.save(LeasesTenants, leasesTenants);
	}
}
