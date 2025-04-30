import { Lease } from '../database/entities/lease.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TenantUser } from '../database/entities/tenant.entity';
import { LeasesTenants } from '../database/entities/leases-tenants.entity';
import { LeaseTenantResponseDto } from 'apps/klubiq-dashboard/src/tenants/dto/responses/lease-tenant.dto';
import { GetTenantDto } from 'apps/klubiq-dashboard/src/tenants/dto/requests/get-tenant-dto';
import { OrganizationTenants } from '../database/entities/organization-tenants.entity';

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

	async getTenantById(tenantId: string, manager: EntityManager = this.manager) {
		if (!tenantId) {
			throw new BadRequestException('Tenant ID is required.');
		}

		const tenant = await manager
			.createQueryBuilder(TenantUser, 'tenant')
			.leftJoinAndSelect('tenant.profile', 'profile')
			.where('tenant.id = :tenantId', { tenantId })
			.select([
				'tenant.id',
				'tenant.isActive',
				'profile.firstName',
				'profile.email',
				'profile.lastName',
				'profile.phoneNumber',
			])
			.getOne();

		if (!tenant) {
			throw new BadRequestException('Tenant not found.');
		}

		return tenant;
	}

	async getTenantByLeaseId(
		leaseId: string,
		manager: EntityManager = this.manager,
	) {
		if (!leaseId) {
			throw new BadRequestException('Lease ID is required.');
		}

		const lease = await manager.findOne(Lease, {
			where: { id: leaseId },
		});

		if (!lease) {
			throw new BadRequestException('Lease not found.');
		}

		return manager.find(LeasesTenants, {
			where: { leaseId },
			relations: ['tenant'],
		});
	}

	async findByLeaseId(leaseId: string): Promise<LeaseTenantResponseDto[]> {
		const records: any = await this.getTenantByLeaseId(leaseId);
		return Promise.all(
			records.map(async (record) => {
				const profile = await record.tenant.profile;

				return {
					id: record.id,
					isPrimaryTenant: record.isPrimaryTenant,
					tenant: {
						id: record.tenant.id,
						fullName: profile.firstName + ' ' + profile.lastName,
						email: profile.email,
						phone: profile.phoneNumber,
					},
					lease: {
						id: record.leaseId,
						leaseStart: record.lease?.startDate, // optional chaining if lease is not eager loaded
						leaseEnd: record.lease?.endDate,
						rentAmount: record.lease?.rentAmount,
						unitId: record.lease?.unit_unitnumber,
						isDraft: record.lease?.isDraft,
						lastPaymentDate: record.lease?.lastPaymentDate,
						name: record.lease?.name,
						customPaymentFrequency: record.lease?.customPaymentFrequency,
						deletedAt: record.lease?.deletedAt,
						createdDate: record.lease?.createdDate,
						securityDeposit: record.lease?.securityDeposit,
					},
				};
			}),
		);
	}

	async getAllLeasesTenant(manager: EntityManager = this.manager) {
		return manager.find(LeasesTenants, {
			relations: ['tenant', 'lease'],
		});
	}

	async findAllLeasesTenant(
		getTenantDto: GetTenantDto,
	): Promise<[LeaseTenantResponseDto[], number]> {
		const [records, total] = await this.manager
			.getRepository(LeasesTenants)
			.createQueryBuilder('lt')
			.leftJoinAndSelect('lt.tenant', 'tenant')
			.leftJoinAndSelect('lt.lease', 'lease')
			.skip((getTenantDto.page - 1) * getTenantDto.skip)
			.getManyAndCount();

		const items: LeaseTenantResponseDto[] = await Promise.all(
			records.map(async (record) => {
				const profile = await record.tenant.profile;
				return {
					id: record.id,
					isPrimaryTenant: record.isPrimaryTenant,
					tenant: {
						id: record.tenant.id,
						fullName: `${profile.firstName} ${profile.lastName}`,
						email: profile.email,
						phone: profile.phoneNumber,
					},
					lease: {
						id: record.lease.id,
						leaseStart: record.lease.startDate,
						leaseEnd: record.lease.endDate,
						rentAmount: record.lease.rentAmount,
						unitId: record.lease.unit_unitnumber,
					},
				};
			}),
		);

		return [items, total];
	}

	async organizationTenants(
		organizationUuid: string,
		manager: EntityManager = this.manager,
	) {
		if (!organizationUuid) {
			throw new BadRequestException('Organization ID is required.');
		}

		const tenants = await manager
			.createQueryBuilder(OrganizationTenants, 'orgTenant')
			.leftJoinAndSelect('orgTenant.tenant', 'tenant')
			.leftJoinAndSelect('tenant.profile', 'profile')
			.where('orgTenant.organizationUuid = :organizationUuid', {
				organizationUuid,
			})
			.getManyAndCount();

		if (!tenants) {
			throw new BadRequestException('Tenants not found for this organization.');
		}

		return tenants;
	}
}
