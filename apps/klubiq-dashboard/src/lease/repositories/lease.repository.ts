import { Lease } from '@app/common/database/entities/lease.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Brackets, EntityManager, In, SelectQueryBuilder } from 'typeorm';
import { DateTime } from 'luxon';
import { CreateLeaseDto } from '../dto/requests/create-lease.dto';
import { UpdateLeaseDto } from '../dto/requests/update-lease.dto';
import {
	DisplayOptions,
	GetLeaseDto,
	LeaseFilterDto,
} from '../dto/requests/get-lease.dto';
import { indexOf } from 'lodash';
import { CreateTenantDto } from '@app/common/dto/requests/create-tenant.dto';
import { TenantUser } from '@app/common/database/entities/tenant.entity';
import ShortUniqueId from 'short-unique-id';
import { PropertyLeaseMetrics } from '../dto/responses/view-lease.dto';
import { Unit } from '@app/common/database/entities/unit.entity';
import {
	LeaseStatus,
	PaymentFrequency,
} from '@app/common/config/config.constants';
import { RentOverdueLeaseDto } from '@app/common/dto/responses/dashboard-metrics.dto';

@Injectable()
export class LeaseRepository extends BaseRepository<Lease> {
	protected readonly logger = new Logger(LeaseRepository.name);
	private readonly nonFilterColumns = [
		'skip',
		'take',
		'order',
		'sortBy',
		'page',
		'display',
		'unitType',
	];
	private readonly uniqueId = new ShortUniqueId({ length: 10 });
	constructor(manager: EntityManager) {
		super(Lease, manager);
	}

	async createLease(
		leaseDto: CreateLeaseDto,
		organizationUuid: string,
		isDraft: boolean,
	) {
		const { unitId, newTenants, tenantsIds, startDate, ...leaseData } =
			leaseDto;
		const newLeaseStartDate = DateTime.fromISO(startDate).toSQL({
			includeOffset: false,
		});
		const activeStatuses = [`${LeaseStatus.ACTIVE}`, `${LeaseStatus.EXPIRING}`];
		return await this.manager.transaction(
			async (transactionalEntityManager) => {
				const overlappingLease = await transactionalEntityManager
					.createQueryBuilder(Lease, 'lease')
					.where('lease."unitId" = :unitId', { unitId })
					.andWhere(
						':newLeaseStartDate BETWEEN lease."startDate" AND lease."endDate"',
						{ newLeaseStartDate },
					)
					.andWhere('lease.status IN (:...statuses)', {
						statuses: activeStatuses,
					})
					.getOne();
				if (overlappingLease) {
					throw new BadRequestException(
						'The unit already has an active lease during the specified period.',
					);
				}
				const unit = await transactionalEntityManager.findOneBy(Unit, {
					id: unitId,
				});
				if (!unit) {
					throw new BadRequestException('Invalid unit ID.');
				}
				const tenantsData = tenantsIds?.length
					? await transactionalEntityManager.findBy(TenantUser, {
							id: In(tenantsIds),
						})
					: [];
				if (newTenants?.length) {
					const newTenantsData = await transactionalEntityManager.save(
						TenantUser,
						newTenants,
					);
					tenantsData.push(...newTenantsData);
				}
				const lease = transactionalEntityManager.create(Lease, {
					startDate: newLeaseStartDate,
					endDate: DateTime.fromISO(leaseData.endDate).toSQL({
						includeOffset: false,
					}),
					unit,
					tenants: tenantsData,
					isDraft,
					organizationUuid,
					...leaseData,
				});
				const savedLease = await transactionalEntityManager.save(lease);
				return savedLease;
			},
		);
	}

	async getUnitLeases(unitId: number, includeArchived: boolean = false) {
		const queryBuilder = this.createQueryBuilder('lease')
			.leftJoinAndSelect('lease.tenants', 'tenant')
			.leftJoinAndSelect('lease.unit', 'unit')
			.leftJoinAndSelect('unit.property', 'property')
			.select([
				'lease.id as id',
				'lease.startDate AS startDate',
				'lease.endDate AS endDate',
				'lease.rentAmount AS rentAmount',
				'lease.status AS status',
				'tenant.firstName AS tenant_firstName',
				'tenant.lastName AS tenant_lastName',
				'property.name AS property_name',
				'property.organizationUuid AS property_organizationUuid',
				'property.managerUid AS property_managerUid',
				'property.ownerUid AS property_ownerUid',
				'unit.unitNumber AS unit_unitNumber',
			])
			.where('lease.unitId = :unitId', { unitId });
		if (!includeArchived) {
			queryBuilder.andWhere('lease.isArchived = :includeArchived', {
				includeArchived,
			});
		}
		const result = await queryBuilder.getRawMany();
		return result;
	}

	async getLeaseById(id: number) {
		const lease = await this.createQueryBuilder('lease')
			.innerJoin('lease.unit', 'unit')
			.innerJoin('unit.property', 'property')
			.leftJoin('property.address', 'address')
			.innerJoin('property.type', 'type')
			.leftJoin('lease.tenants', 'tenant')
			.select([
				'lease.id AS id',
				'lease.status AS status',
				'TO_CHAR(lease."startDate"::DATE, \'YYYY-MM-DD\') AS start_date',
				'TO_CHAR(lease."endDate"::DATE, \'YYYY-MM-DD\') AS end_date',
				'lease.rentAmount AS rent_amount',
				'lease.paymentFrequency AS payment_frequency',
				'lease.rentDueDay AS rent_due_day',
				'property.name AS property_name',
				`CONCAT(address."addressLine1", ' ', address."addressLine2", ', ', address.city, ', ', address.state, ', ', address."postalCode", ', ', address.country) AS property_address`,
				'type.name AS property_type',
				'unit.unitNumber AS unit_number',
				'property.isMultiUnit AS is_multi_unit_property',
				"TO_CHAR(public.calculate_next_rent_due_date(lease.startDate, lease.endDate, lease.rentDueDay, lease.paymentFrequency, lease.customPaymentFrequency, lease.lastPaymentDate)::DATE, 'YYYY-MM-DD')AS next_payment_date",
				'tenant.firstName AS tenant_first_name',
				'tenant.lastName AS tenant_last_name',
			])
			.where('lease.id = :id', { id })
			.getRawOne();
		return lease;
	}

	async updateLease(id: number, leaseDto: UpdateLeaseDto): Promise<Lease> {
		if (leaseDto.startDate)
			leaseDto.startDate = DateTime.fromISO(leaseDto.startDate).toSQL({
				includeOffset: false,
			});
		if (leaseDto.endDate)
			leaseDto.endDate = DateTime.fromISO(leaseDto.endDate).toSQL({
				includeOffset: false,
			});
		const lease = await this.preload({ id, ...leaseDto });
		await this.update(id, lease);
		return lease;
	}

	private async getLeaseFilterQueryString(
		filterDto: LeaseFilterDto,
		queryBuilder: SelectQueryBuilder<Lease>,
	) {
		if (filterDto) {
			Object.keys(filterDto).forEach((key) => {
				const value = filterDto[key];
				if (typeof value !== 'undefined' && value !== null) {
					if (key === 'search') {
						queryBuilder.andWhere(`lease.name LIKE :${key}`, {
							[key]: `%${value}%`,
						});
					} else if (key === 'display') {
						queryBuilder.andWhere(`lease.isArchived = :${key}`, {
							[key]: value === DisplayOptions.ARCHIVED ? true : false,
						});
					} else if (key === 'unitId') {
						queryBuilder.andWhere(`unit.id = :${key}`, {
							[key]: value,
						});
					} else if (key === 'propertyId') {
						queryBuilder.andWhere(`property.uuid = :${key}`, {
							[key]: value,
						});
					} else if (indexOf(this.nonFilterColumns, key) < 0) {
						queryBuilder.andWhere(`lease.${key} = :${key}`, {
							[key]: value,
						});
					}
				}
			});
		}
	}

	async getOrganizationLeases(
		orgUuid: string,
		userId: string,
		getLeaseDto?: GetLeaseDto,
		isOrgOwner: boolean = false,
	): Promise<[Lease[], number]> {
		const queryBuilder = this.createQueryBuilder('lease')
			.leftJoinAndSelect('lease.tenants', 'tenant')
			.leftJoinAndSelect('lease.unit', 'unit')
			.leftJoinAndSelect('unit.property', 'property')
			.select([
				'lease.id',
				'lease.name',
				'lease.isArchived',
				'lease.isDraft',
				'lease.createdDate',
				'lease.startDate',
				'lease.endDate',
				'lease.rentAmount',
				'lease.status',
				'tenant.firstName',
				'tenant.lastName',
				'property.name',
				'property.organizationUuid',
				'property.managerUid',
				'property.ownerUid',
				'property.uuid',
				'unit.unitNumber',
				'unit.id',
			])
			.where('property.organizationUuid = :orgUuid', { orgUuid });
		if (!isOrgOwner) {
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where('property.ownerUid = :ownerUid', {
						ownerUid: userId,
					}).orWhere('property.managerUid = :managerUid', {
						managerUid: userId,
					});
				}),
			);
		}
		await this.getLeaseFilterQueryString(getLeaseDto, queryBuilder);
		queryBuilder
			.orderBy(`lease.${getLeaseDto.sortBy}`, getLeaseDto.order)
			.skip(getLeaseDto.skip)
			.take(getLeaseDto.take);
		return await queryBuilder.getManyAndCount();
	}

	async addTenantToLease(tenantDtos: CreateTenantDto[], leaseId: number) {
		await this.manager.transaction(async (transactionalEntityManager) => {
			const tenants: TenantUser[] = tenantDtos.map((tenant) => ({
				...tenant,
				dateOfBirth: DateTime.fromISO(tenant.dateOfBirth).toJSDate(),
			}));

			const tenantUsers = await transactionalEntityManager.save(
				TenantUser,
				tenants,
			);
			await transactionalEntityManager
				.createQueryBuilder()
				.relation(Lease, 'tenants')
				.of(leaseId)
				.add(tenantUsers);
		});
		return await this.getLeaseById(leaseId);
	}

	async getPropertyLeaseMetrics(
		propertyUuid: string,
	): Promise<PropertyLeaseMetrics> {
		const query = `
    		WITH filtered_leases AS (
    		    SELECT 
    		        l.id,
    		        l."propertyUuid",
    		        l."unitId",
    		        l."rentAmount",
    		        lt."rentAmount"
    		    FROM poo.lease l
    		    LEFT JOIN (
    		        SELECT lt."leaseId", COUNT(DISTINCT lt."tenantId") AS "rentAmount"
    		        FROM poo.lease_tenants lt
    		        GROUP BY lt."leaseId"
    		    ) lt ON lt."leaseId" = l.id
    		    WHERE (l."propertyUuid" = :uuid OR l."unitId" IN (SELECT id FROM poo.unit WHERE "propertyUuid" = :uuid))
    		      AND l."endDate" > NOW() AT TIME ZONE 'UTC'
    		)
    		SELECT 
    		    -- Property-level metrics
    		    COALESCE(SUM(CASE WHEN fl."propertyUuid" = :uuid THEN 1 ELSE 0 END), 0) AS propertyLeaseCount,
    		    COALESCE(SUM(CASE WHEN fl."propertyUuid" = :uuid THEN fl."rentAmount" ELSE 0 END), 0) AS totalPropertyRent,
    		    COALESCE(SUM(CASE WHEN fl."propertyUuid" = :uuid THEN fl."rentAmount" ELSE 0 END), 0) AS totalPropertyTenants,

    		    -- Unit-level metrics
    		    COALESCE(SUM(CASE WHEN u."propertyUuid" = :uuid THEN 1 ELSE 0 END), 0) AS unitLeaseCount,
    		    COALESCE(SUM(CASE WHEN u."propertyUuid" = :uuid THEN fl."rentAmount" ELSE 0 END), 0) AS totalUnitRent,
    		    COUNT(DISTINCT CASE WHEN u."propertyUuid" = :uuid THEN u.id ELSE NULL END) AS occupiedUnitCount,
    		    COALESCE(SUM(CASE WHEN u."propertyUuid" = :uuid THEN fl."rentAmount" ELSE 0 END), 0) AS totalUnitTenants,

    		    -- Combined metrics
    		    GREATEST(
    		        COALESCE(SUM(CASE WHEN fl."propertyUuid" = :uuid THEN 1 ELSE 0 END), 0),
    		        COALESCE(SUM(CASE WHEN u."propertyUuid" = :uuid THEN 1 ELSE 0 END), 0)
    		    ) AS finalPropertyLeaseCount,
    		    COALESCE(
    		        SUM(CASE WHEN fl."propertyUuid" = :uuid THEN fl."rentAmount" ELSE 0 END), 0
    		    ) + COALESCE(
    		        SUM(CASE WHEN u."propertyUuid" = :uuid THEN fl."rentAmount" ELSE 0 END), 0
    		    ) AS finalTotalRent,
    		    COALESCE(
    		        SUM(CASE WHEN fl."propertyUuid" = :uuid THEN fl."rentAmount" ELSE 0 END), 0
    		    ) + COALESCE(
    		        SUM(CASE WHEN u."propertyUuid" = :uuid THEN fl."rentAmount" ELSE 0 END), 0
    		    ) AS finalTotalTenants

    		FROM filtered_leases fl
    		LEFT JOIN unit u ON fl."unitId" = u.id
    		WHERE fl."propertyUuid" = :uuid OR u."propertyUuid" = :uuid`;
		const queryResult = await this.manager.query(query, [
			{ uuid: propertyUuid },
		]);
		const propertyLeaseMetrics: PropertyLeaseMetrics = {
			propertyLeaseCount: queryResult[0].finalpropertyleasecount,
			unitLeaseCount: queryResult[0].unitleasecount,
			occupiedUnitCount: queryResult[0].occupiedunitcount,
			totalRent: queryResult[0].finaltotalrent,
			totalTenants: queryResult[0].finaltotaltenants,
		};
		return propertyLeaseMetrics;
	}

	async getOverdueRentData(
		organizationUuid: string,
	): Promise<RentOverdueLeaseDto> {
		const query = `
			WITH lease_details AS (
				SELECT 
					l.id AS lease_id,
					l."rentAmount",
					COALESCE(l."lastPaymentDate", l."startDate") AS base_date,
					CASE
						WHEN l."paymentFrequency" = '${PaymentFrequency.MONTHLY}' 	THEN INTERVAL '1 MONTH'
						WHEN l."paymentFrequency" = '${PaymentFrequency.QUARTERLY}' THEN INTERVAL '3 MONTHS'
						WHEN l."paymentFrequency" = '${PaymentFrequency.ANNUALLY}' 	THEN INTERVAL '1 YEAR'
						WHEN l."paymentFrequency" = '${PaymentFrequency.WEEKLY}' 	THEN INTERVAL '1 WEEK'
						WHEN l."paymentFrequency" = '${PaymentFrequency.BI_WEEKLY}' THEN INTERVAL '2 WEEKS'
						WHEN l."paymentFrequency" = '${PaymentFrequency.BI_MONTHLY}' THEN INTERVAL '2 MONTHS'
						WHEN l."paymentFrequency" = '${PaymentFrequency.CUSTOM}' THEN make_interval(days=>l."customPaymentFrequency")
						ELSE INTERVAL '1 MONTH'
					END	AS interval_unit
				FROM
					poo.lease l),
			missed_payments AS (
				-- Calculate the number of payment periods missed based on the payment frequency
				SELECT
					ld.lease_id,
					ld."rentAmount",
					GREATEST(0, FLOOR(EXTRACT(EPOCH FROM AGE(CURRENT_DATE, ld.base_date)) / 
            		COALESCE(NULLIF(EXTRACT(EPOCH FROM ld.interval_unit), 0), l."customPaymentFrequency" * 86400)))::INT AS missed_periods,
        			ld."rentAmount" * GREATEST(0, FLOOR(EXTRACT(EPOCH FROM AGE(CURRENT_DATE, ld.base_date)) / 
            		COALESCE(NULLIF(EXTRACT(EPOCH FROM ld.interval_unit), 0), l."customPaymentFrequency" * 86400)))::INT AS total_due
				FROM lease_details ld
				JOIN poo.lease l ON ld.lease_id = l.id
				)
			SELECT
				COUNT(mp.lease_id) AS overdue_lease_count,
				SUM(mp.total_due) AS overdue_lease_total
			FROM missed_payments mp
			LEFT JOIN poo.lease_payment_totals lp ON mp.lease_id = lp."leaseId"
			JOIN poo.lease l ON mp.lease_id = l.id
			WHERE
				mp.total_due > COALESCE(lp.total_paid, 0)
				AND l."endDate" >= 	CURRENT_DATE
				AND COALESCE(l."nextDueDate", public.calculate_next_rent_due_date(l."startDate",l."endDate", l."rentDueDay", l."paymentFrequency", l."customPaymentFrequency", l."lastPaymentDate")) <= CURRENT_DATE
				AND l."isArchived" = false
				AND  l."organizationUuid" = $1;`;
		const overdueRentsResult = await this.manager.query(query, [
			organizationUuid,
		]);
		const overdueRents: RentOverdueLeaseDto = overdueRentsResult.length
			? {
					overDueLeaseCount:
						parseInt(overdueRentsResult[0].overdue_lease_count, 10) || 0,
					overDueRentSum:
						parseFloat(overdueRentsResult[0].overdue_lease_total) || 0,
				}
			: { overDueLeaseCount: 0, overDueRentSum: 0 };
		return overdueRents;
	}
}
//(public.calculate_future_next_due_date(lease.startDate, lease.lastPaymentDate, lease.paymentFrequency, lease.customPaymentFrequency, lease.rentDueDay)::DATE, 'YYYY-MM-DD') AS next_payment_date",
