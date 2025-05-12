import { Lease } from '../database/entities/lease.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { TenantUser } from '../database/entities/tenant.entity';
import { LeasesTenants } from '../database/entities/leases-tenants.entity';
import {
	LeaseTenantResponseDto,
	TenantDto,
} from 'apps/klubiq-dashboard/src/tenants/dto/responses/lease-tenant.dto';
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
		try {
			if (!tenantId || !leaseId) {
				throw new BadRequestException(
					'Tenant ID and Lease ID must be provided.',
				);
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
		} catch (error) {
			throw error;
		}
	}

	async getTenantByLeaseId(
		leaseId: string,
		manager: EntityManager = this.manager,
	) {
		try {
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
		} catch (error) {
			return error;
		}
	}

	async findByLeaseId(leaseId: string): Promise<LeaseTenantResponseDto[]> {
		try {
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
		} catch (error) {
			throw error;
		}
	}

	async getAllLeasesTenant(manager: EntityManager = this.manager) {
		try {
			return manager.find(LeasesTenants, {
				relations: ['tenant', 'lease'],
			});
		} catch (error) {
			return error;
		}
	}

	async findAllLeasesTenant(
		getTenantDto: GetTenantDto,
	): Promise<[LeaseTenantResponseDto[], number]> {
		try {
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
		} catch (error) {
			throw error;
		}
	}

	private async getPropertiesFilterQueryString(
		filterDto: TenantDto,
		queryBuilder: SelectQueryBuilder<TenantUser>,
	) {
		if (filterDto) {
			Object.keys(filterDto).forEach((key) => {
				const value = filterDto[key];
				if (typeof value !== 'undefined' && value !== null) {
					if (key === 'search') {
						queryBuilder.andWhere(`property.name ILIKE :${key}`, {
							[key]: `%${value}%`,
						});
					}
				}
			});
		}
	}

	async organizationTenants(
		organizationUuid: string,
		getTenantDto?: GetTenantDto,
	): Promise<[OrganizationTenants[], number]> {
		console.log({ getTenantDto });

		try {
			if (!organizationUuid) {
				throw new BadRequestException('Organization ID is required.');
			}
			const tenants = await this.manager
				.createQueryBuilder(OrganizationTenants, 'orgTenant')
				.leftJoinAndSelect('orgTenant.tenant', 'tenant')
				.leftJoinAndSelect('tenant.profile', 'profile')
				.where('orgTenant.organizationUuid = :organizationUuid', {
					organizationUuid,
				});

			return await tenants.getManyAndCount();
		} catch (error) {
			throw error;
		}
	}

	async getTenantById(tenantId: string): Promise<{
		tenant: {
			id: string;
			fullName: string;
			email: string;
			phone: string;
		};
		activeLeases: {
			id: string;
			leaseStart: Date;
			leaseEnd: Date;
			rentAmount: number;
			unitId: string;
			unitNumber: string;
			propertyName: string;
			propertyAddress: string;
			securityDeposit: number;
			paymentFrequency: string;
			nextDueDate: Date;
			lastPaymentDate: Date;
			lateFeeAmount: number;
		}[];
		inactiveLeases: {
			id: string;
			leaseStart: Date;
			leaseEnd: Date;
			rentAmount: number;
			unitId: string;
			unitNumber: string;
			propertyName: string;
			propertyAddress: string;
			securityDeposit: number;
			paymentFrequency: string;
			nextDueDate: Date;
			lastPaymentDate: Date;
			lateFeeAmount: number;
		}[];
	}> {
		if (!tenantId) {
			throw new BadRequestException('Tenant ID is required');
		}

		const records = await this.manager
			.getRepository(LeasesTenants)
			.createQueryBuilder('lt')
			.leftJoinAndSelect('lt.tenant', 'tenant')
			.leftJoinAndSelect('tenant.profile', 'profile')
			.leftJoinAndSelect('lt.lease', 'lease')
			.leftJoinAndSelect('lease.unit', 'unit')
			.leftJoinAndSelect('unit.property', 'property')
			.leftJoinAndSelect('property.address', 'address')
			.where('tenant.id = :tenantId', { tenantId })
			.getMany();

		if (records.length === 0) {
			throw new NotFoundException('Tenant or leases not found.');
		}

		const tenantProfile = records[0].tenant.profile;

		return {
			tenant: {
				id: records[0].tenant.id,
				fullName: `${(await tenantProfile).firstName} ${(await tenantProfile).lastName}`,
				email: (await tenantProfile).email,
				phone: (await tenantProfile).phoneNumber,
			},
			activeLeases: records
				.filter(
					(record: any) =>
						record.lease.status.toUpperCase() === 'ACTIVE' &&
						!record.lease.isArchived,
				)
				.map((record) => ({
					id: record.lease.id,
					leaseStart: record.lease.startDate,
					leaseEnd: record.lease.endDate,
					rentAmount: record.lease.rentAmount,
					unitId: record.lease.unit.id,
					unitNumber: record.lease.unit.unitNumber,
					propertyName: record.lease.unit.property.name,
					propertyAddress: `${record.lease.unit.property.address.addressLine1} ${record.lease.unit.property.address.city} ${record.lease.unit.property.address.state}`,
					paymentFrequency: record.lease.paymentFrequency,
					lastPaymentDate: record.lease.lastPaymentDate,
					nextDueDate: record.lease.nextDueDate,
					lateFeeAmount: record.lease.lateFeeAmount,
					securityDeposit: record.lease.securityDeposit,
					status: record.lease.status,
				})),
			inactiveLeases: records
				.filter(
					(record: any) =>
						record.lease.status.toUpperCase() === 'INACTIVE' ||
						record.lease.isArchived,
				)
				.map((record) => ({
					id: record.lease.id,
					leaseStart: record.lease.startDate,
					leaseEnd: record.lease.endDate,
					rentAmount: record.lease.rentAmount,
					unitId: record.lease.unit.id,
					unitNumber: record.lease.unit.unitNumber,
					propertyName: record.lease.unit.property.name,
					propertyAddress: `${record.lease.unit.property.address.addressLine1} ${record.lease.unit.property.address.city} ${record.lease.unit.property.address.state}`,
					paymentFrequency: record.lease.paymentFrequency,
					lastPaymentDate: record.lease.lastPaymentDate,
					nextDueDate: record.lease.nextDueDate,
					lateFeeAmount: record.lease.lateFeeAmount,
					securityDeposit: record.lease.securityDeposit,
					status: record.lease.status,
				})),
		};
	}

	async removeTenantFromOrganization(
		tenantId: string,
		organizationId: string,
		manager: EntityManager = this.manager,
	): Promise<void> {
		try {
			if (!tenantId || !organizationId) {
				throw new BadRequestException(
					'Tenant ID and Organization ID are required.',
				);
			}

			const orgTenant = await manager.findOne(OrganizationTenants, {
				where: {
					tenant: { id: tenantId },
					organizationUuid: organizationId,
				},
			});

			if (!orgTenant) {
				throw new NotFoundException('Tenant not found in organization.');
			}

			await manager.delete(LeasesTenants, {
				tenant: { id: tenantId },
			});

			await manager.remove(OrganizationTenants, orgTenant);
		} catch (error) {
			throw error;
		}
	}

	async removeTenantFromLease(
		tenantId: string,
		leaseId: string,
		manager: EntityManager = this.manager,
	): Promise<void> {
		try {
			if (!tenantId || !leaseId) {
				throw new BadRequestException('Tenant ID and Lease ID are required.');
			}

			// Remove leases associated with this tenant
			await manager.delete(LeasesTenants, {
				tenant: { id: tenantId },
			});
		} catch (error) {
			throw error;
		}
	}
}
