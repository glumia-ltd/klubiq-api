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
import { Unit } from '../../properties/entities/unit.entity';

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
		isDraft: boolean,
	): Promise<Lease> {
		const { unitId, newTenants, tenantsIds, ...leaseData } = leaseDto;
		return await this.manager.transaction(
			async (transactionalEntityManager) => {
				const unit = await transactionalEntityManager.findOneBy(Unit, {
					id: unitId,
				});
				const tenantsData = tenantsIds.length
					? await transactionalEntityManager.findBy(TenantUser, {
							id: In(tenantsIds),
						})
					: [];
				if (newTenants.length) {
					const newTenantsData = await transactionalEntityManager.save(
						TenantUser,
						newTenants,
					);
					tenantsData.push(...newTenantsData);
				}
				const lease = await transactionalEntityManager.create(Lease, {
					startDate: DateTime.fromISO(leaseData.startDate).toSQL(),
					endDate: DateTime.fromISO(leaseData.endDate).toSQL(),
					unit,
					tenants: tenantsData,
					isDraft,
					...leaseData,
				});
				const savedLease = await transactionalEntityManager.save(lease);
				return savedLease;
			},
		);
	}

	async getPropertyLeases(
		propertyUuId: string,
		organizationUuid: string,
		includeArchived: boolean = false,
	): Promise<Lease[]> {
		try {
			const queryBuilder = this.createQueryBuilder('lease')
				.where('lease.propertyUuId = :propertyUuId', { propertyUuId })
				.leftJoinAndSelect(
					'lease.property',
					'p',
					'p.organizationUuid = :organizationUuid',
					{ organizationUuid },
				)
				.leftJoinAndSelect('lease.transactions', 'ltr')
				.leftJoinAndSelect('lease.tenants', 'lte');

			if (!includeArchived) {
				queryBuilder.andWhere('lease.isArchived = :includeArchived', {
					includeArchived,
				});
			}
			const result = await queryBuilder.getMany();
			return result;
		} catch (e) {
			this.logger.error(
				`Error getting leases for property: 
                ${propertyUuId} in Organization: ${organizationUuid}`,
				e,
				'Lease Repository',
			);
			throw new BadRequestException(
				e.message,
				`Error getting leases for property: 
                ${propertyUuId} in Organization: ${organizationUuid}`,
			);
		}
	}

	async getLeaseById(id: number): Promise<Lease> {
		try {
			const lease = await this.createQueryBuilder('lease')
				.where('lease.id = :id', { id })
				.leftJoinAndSelect('lease.tenants', 'lte')
				.leftJoinAndSelect('lease.transactions', 'ltr')
				.getOne();
			return lease;
		} catch (e) {
			this.logger.error(`Error getting lease: ${id}`, e, 'LeaseRepository');
		}
	}

	async updateLease(id: number, leaseDto: UpdateLeaseDto): Promise<Lease> {
		try {
			if (leaseDto.startDate)
				leaseDto.startDate = DateTime.fromSQL(leaseDto.startDate).toSQL();
			if (leaseDto.endDate)
				leaseDto.endDate = DateTime.fromSQL(leaseDto.endDate).toSQL();
			const lease = await this.preload({ id, ...leaseDto });
			await this.update(id, lease);
			return lease;
		} catch (e) {
			this.logger.error(`Error updating lease: ${id}`, e, 'LeaseRepository');
			throw new BadRequestException(e.message, `Error updating lease: ${id}`);
		}
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
						queryBuilder.andWhere(`lease.isDraft = :${key}`, {
							[key]: value === DisplayOptions.DRAFT ? true : false,
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
		try {
			const queryBuilder = this.createQueryBuilder('lease');
			queryBuilder
				.leftJoinAndSelect('lease.property', 'p')
				.leftJoinAndSelect('lease.tenants', 'lte')
				.leftJoinAndSelect('lease.transactions', 'ltr')
				.where('p.organizationUuid = :orgUuid', { orgUuid });
			if (!isOrgOwner) {
				queryBuilder.andWhere(
					new Brackets((qb) => {
						qb.where('p.ownerUid = :ownerUid', {
							ownerUid: userId,
						}).orWhere('p.managerUid = :managerUid', {
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
		} catch (e) {
			this.logger.error(
				'Error getting organization leases',
				e,
				'LeaseRepository',
			);
			throw new BadRequestException(
				e.message,
				'Error getting organization leases',
			);
		}
	}

	async addTenantToLease(
		tenantDtos: CreateTenantDto[],
		leaseId: number,
	): Promise<Lease> {
		try {
			await this.manager.transaction(async (transactionalEntityManager) => {
				const tenants: TenantUser[] = tenantDtos.map((tenant) => ({
					...tenant,
					dateOfBirth: DateTime.fromISO(tenant.dateOfBirth).toJSDate(),
					// profile: {
					// 	email: tenant.email,
					// 	firebaseId: this.uniqueId.rnd()
					// }
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
			const leaseData = await this.findOneBy({ id: leaseId });
			return leaseData;
		} catch (e) {
			this.logger.error(e.message);
			throw new BadRequestException(e.message, 'Error adding tenant to lease');
		}
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
}
