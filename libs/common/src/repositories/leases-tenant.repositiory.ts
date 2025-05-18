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
import {
	GetTenantDto,
	TenantListDto,
} from 'apps/klubiq-dashboard/src/tenants/dto/requests/get-tenant-dto';
import { OrganizationTenants } from '../database/entities/organization-tenants.entity';
import { PaymentStatus } from '../config/config.constants';
import { Transaction } from '../database/entities/transaction.entity';

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
	): Promise<[TenantListDto[], number]> {
		if (!organizationUuid) {
			throw new BadRequestException('Organization ID is required.');
		}

		const query = this.manager
			.createQueryBuilder()
			.select('tenant.id', 'id')
			.addSelect('profile.profileUuid', 'profileUuid')
			.addSelect("CONCAT(profile.firstName, ' ', profile.lastName)", 'fullName')
			.addSelect('tenant.companyName', 'companyName')
			.addSelect('COUNT(DISTINCT lease.id)', 'activeLeaseCount')
			.addSelect('MAX(lease.startDate)', 'mostRecentLeaseStartDate')
			.from(OrganizationTenants, 'orgTenant')
			.innerJoin('orgTenant.tenant', 'tenant')
			.leftJoin('tenant.profile', 'profile')
			.leftJoin('tenant.leasesTenants', 'leasesTenants')
			.leftJoin('leasesTenants.lease', 'lease', "lease.status = 'Active'")
			.leftJoin('lease.unit', 'unit')
			.leftJoin('unit.property', 'property')
			.where('orgTenant.organizationUuid = :organizationUuid', {
				organizationUuid,
			})
			.groupBy(
				'tenant.id, profile.profileUuid, profile.firstName, profile.lastName, tenant.companyName',
			);

		if (getTenantDto?.sortBy && getTenantDto?.order) {
			query.orderBy(
				`tenant.${getTenantDto.sortBy}`,
				getTenantDto.order.toUpperCase() as 'ASC' | 'DESC',
			);
		}

		if (getTenantDto?.skip !== undefined) query.skip(getTenantDto.skip);
		if (getTenantDto?.take !== undefined) query.take(getTenantDto.take);

		const [rawTenants, total] = await Promise.all([
			query.getRawMany(),
			query.getCount(),
		]);

		const formattedTenantsList = await Promise.all(
			rawTenants.map(async (tenant) => {
				const lease = await this.manager
					.createQueryBuilder(Lease, 'lease')
					.innerJoinAndSelect('lease.unit', 'unit')
					.innerJoinAndSelect('unit.property', 'property')
					.innerJoin('lease.leasesTenants', 'lt')
					.where('lt.tenantId = :tenantId', { tenantId: tenant.id })
					.andWhere('lease.status = :status', { status: 'Active' })
					.andWhere('lease.startDate = :startDate', {
						startDate: tenant.mostRecentLeaseStartDate,
					})
					.orderBy('lease.startDate', 'DESC')
					.getOne();

				let mostRecentPaymentStatus: PaymentStatus | null = null;

				if (lease?.id) {
					const transaction = await this.manager
						.createQueryBuilder(Transaction, 'transaction')
						.where('transaction.leaseId = :leaseId', { leaseId: lease.id })
						.orderBy('transaction.transactionDate', 'DESC')
						.getOne();

					mostRecentPaymentStatus = transaction?.status ?? null;
				}

				return {
					...tenant,
					mostRecentLeaseId: lease?.id || null,
					mostRecentUnitId: lease?.unit?.id || null,
					mostRecentUnitName: lease?.unit?.unitNumber || null,
					mostRecentPropertyId: lease?.unit?.property?.id || null,
					mostRecentPropertyName: lease?.unit?.property?.name || null,
					mostRecentPaymentStatus,
				};
			}),
		);

		return [formattedTenantsList, total];
	}

	async getTenantById(tenantId: string): Promise<{
		profile: {
			id: string;
			fullName: string;
			firstName: string;
			lastName: string;
			email: string;
			phoneNumber: string;
			title: string | null;
			profilePicUrl: string | null;
			countryPhoneCode: string | null;
			street: string | null;
			addressLine2: string | null;
			state: string | null;
			city: string | null;
			country: string | null;
			postalCode: string | null;
			formOfIdentity: string | null;
			dateOfBirth: Date | null;
			gender: string | null;
			bio: string | null;
			isTermsAndConditionAccepted: boolean;
			isPrivacyPolicyAgreed: boolean;
			createdDate: Date;
			updatedDate: Date;
			isKYCVerified: boolean;
		};
		summary: {
			totalLeases: number;
			activeLeases: number;
			inactiveLeases: number;
			totalRent: number;
		};
		activeLeases: any[];
		inactiveLeases: any[];
	}> {
		if (!tenantId) {
			throw new BadRequestException('Tenant ID is required');
		}

		const records: any[] = await this.manager
			.getRepository(TenantUser)
			.createQueryBuilder('lt')
			.leftJoinAndSelect('lt.profile', 'profile')
			.leftJoinAndSelect('lt.leasesTenants', 'leasesTenants')
			.leftJoinAndSelect('leasesTenants.lease', 'lease')
			.leftJoinAndSelect('lease.unit', 'unit')
			.leftJoinAndSelect('unit.property', 'property')
			.leftJoinAndSelect('property.address', 'address')
			.where('lt.ID = :tenantId', { tenantId })
			.getMany();

		if (records.length === 0) {
			throw new NotFoundException('Tenant not found.');
		}

		const tenant = records[0];
		const profile = await tenant.profile;

		const validLeases = records
			.flatMap((r) => r.leasesTenants || [])
			.filter((lt: any) => lt.lease);

		const mapLease = (lt: any) => {
			const lease = lt.lease;
			const unit = lease.unit;
			const property = unit.property;
			const address = property.address;

			return {
				id: lease.id,
				leaseStart: lease.startDate,
				leaseEnd: lease.endDate,
				rentAmount: lease.rentAmount,
				unit,
				propertyName: property.name,
				propertyAddress: `${address.addressLine1}, ${address.city}, ${address.state}`,
				paymentFrequency: lease.paymentFrequency,
				lastPaymentDate: lease.lastPaymentDate,
				nextDueDate: lease.nextDueDate,
				lateFeeAmount: lease.lateFeeAmount,
				securityDeposit: lease.securityDeposit,
			};
		};

		const activeLeases = validLeases
			.filter(
				(lt) =>
					lt.lease.status?.toUpperCase() === 'ACTIVE' && !lt.lease.isArchived,
			)
			.map(mapLease);

		const inactiveLeases = validLeases
			.filter(
				(lt) =>
					lt.lease.status?.toUpperCase() !== 'ACTIVE' || lt.lease.isArchived,
			)
			.map(mapLease);

		return {
			profile: {
				id: tenant.id,
				fullName: `${profile.firstName} ${profile.lastName}`,
				firstName: profile.firstName,
				lastName: profile.lastName,
				email: profile.email,
				phoneNumber: profile.phoneNumber,
				title: profile.title ?? null,
				profilePicUrl: profile.profilePicUrl ?? null,
				countryPhoneCode: profile.countryPhoneCode ?? null,
				street: profile.street ?? null,
				addressLine2: profile.addressLine2 ?? null,
				state: profile.state ?? null,
				city: profile.city ?? null,
				country: profile.country ?? null,
				postalCode: profile.postalCode ?? null,
				formOfIdentity: profile.formOfIdentity ?? null,
				dateOfBirth: profile.dateOfBirth ?? null,
				gender: profile.gender ?? null,
				bio: profile.bio ?? null,
				isTermsAndConditionAccepted: profile.isTermsAndConditionAccepted,
				isPrivacyPolicyAgreed: profile.isPrivacyPolicyAgreed,
				createdDate: profile.createdDate,
				updatedDate: profile.updatedDate,
				isKYCVerified: profile.isKYCVerified,
			},
			summary: {
				totalLeases: validLeases.length,
				activeLeases: activeLeases.length,
				inactiveLeases: inactiveLeases.length,
				totalRent: validLeases.reduce(
					(sum, lt) => sum + Number(lt.lease?.rentAmount ?? 0),
					0,
				),
			},
			activeLeases,
			inactiveLeases,
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

	async getTenantByProfileUuid(tenantId: string): Promise<{
		profile: {
			id: string;
			fullName: string;
			firstName: string;
			lastName: string;
			email: string;
			phoneNumber: string;
			title: string | null;
			profilePicUrl: string | null;
			countryPhoneCode: string | null;
			street: string | null;
			addressLine2: string | null;
			state: string | null;
			city: string | null;
			country: string | null;
			postalCode: string | null;
			formOfIdentity: string | null;
			dateOfBirth: Date | null;
			gender: string | null;
			bio: string | null;
			isTermsAndConditionAccepted: boolean;
			isPrivacyPolicyAgreed: boolean;
			createdDate: Date;
			updatedDate: Date;
			isKYCVerified: boolean;
		};
		summary: {
			totalLeases: number;
			activeLeases: number;
			inactiveLeases: number;
			totalRent: number;
		};
		activeLeases: any[];
		inactiveLeases: any[];
	}> {
		if (!tenantId) {
			throw new BadRequestException('Tenant ID is required');
		}

		const records: any[] = await this.manager
			.getRepository(TenantUser)
			.createQueryBuilder('lt')
			.leftJoinAndSelect('lt.profile', 'profile')
			.leftJoinAndSelect('lt.leasesTenants', 'leasesTenants')
			.leftJoinAndSelect('leasesTenants.lease', 'lease')
			.leftJoinAndSelect('lease.unit', 'unit')
			.leftJoinAndSelect('unit.property', 'property')
			.leftJoinAndSelect('property.address', 'address')
			.where('lt.profile = :tenantId', { tenantId })
			.getMany();

		if (records.length === 0) {
			throw new NotFoundException('Tenant not found.');
		}

		const tenant = records[0];
		const profile = await tenant.profile;

		const validLeases = records
			.flatMap((r) => r.leasesTenants || [])
			.filter((lt: any) => lt.lease);

		const mapLease = (lt: any) => {
			const lease = lt.lease;
			const unit = lease.unit;
			const property = unit.property;
			const address = property.address;

			return {
				id: lease.id,
				leaseStart: lease.startDate,
				leaseEnd: lease.endDate,
				rentAmount: lease.rentAmount,
				unit,
				propertyName: property.name,
				propertyAddress: `${address.addressLine1}, ${address.city}, ${address.state}`,
				paymentFrequency: lease.paymentFrequency,
				lastPaymentDate: lease.lastPaymentDate,
				nextDueDate: lease.nextDueDate,
				lateFeeAmount: lease.lateFeeAmount,
				securityDeposit: lease.securityDeposit,
			};
		};

		const activeLeases = validLeases
			.filter(
				(lt) =>
					lt.lease.status?.toUpperCase() === 'ACTIVE' && !lt.lease.isArchived,
			)
			.map(mapLease);

		const inactiveLeases = validLeases
			.filter(
				(lt) =>
					lt.lease.status?.toUpperCase() !== 'ACTIVE' || lt.lease.isArchived,
			)
			.map(mapLease);

		return {
			profile: {
				id: tenant.id,
				fullName: `${profile.firstName} ${profile.lastName}`,
				firstName: profile.firstName,
				lastName: profile.lastName,
				email: profile.email,
				phoneNumber: profile.phoneNumber,
				title: profile.title ?? null,
				profilePicUrl: profile.profilePicUrl ?? null,
				countryPhoneCode: profile.countryPhoneCode ?? null,
				street: profile.street ?? null,
				addressLine2: profile.addressLine2 ?? null,
				state: profile.state ?? null,
				city: profile.city ?? null,
				country: profile.country ?? null,
				postalCode: profile.postalCode ?? null,
				formOfIdentity: profile.formOfIdentity ?? null,
				dateOfBirth: profile.dateOfBirth ?? null,
				gender: profile.gender ?? null,
				bio: profile.bio ?? null,
				isTermsAndConditionAccepted: profile.isTermsAndConditionAccepted,
				isPrivacyPolicyAgreed: profile.isPrivacyPolicyAgreed,
				createdDate: profile.createdDate,
				updatedDate: profile.updatedDate,
				isKYCVerified: profile.isKYCVerified,
			},
			summary: {
				totalLeases: validLeases.length,
				activeLeases: activeLeases.length,
				inactiveLeases: inactiveLeases.length,
				totalRent: validLeases.reduce(
					(sum, lt) => sum + Number(lt.lease?.rentAmount ?? 0),
					0,
				),
			},
			activeLeases,
			inactiveLeases,
		};
	}
}
