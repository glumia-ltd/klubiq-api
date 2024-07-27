import { Lease } from '@app/common/database/entities/lease.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { Injectable, Logger } from '@nestjs/common';
import { Brackets, EntityManager, SelectQueryBuilder } from 'typeorm';
import { DateTime } from 'luxon';
import { CreateLeaseDto } from '../dto/requests/create-lease.dto';
import { LeaseStatus } from '@app/common/config/config.constants';
import { UpdateLeaseDto } from '../dto/requests/update-lease.dto';
import {
	DisplayOptions,
	GetLeaseDto,
	LeaseFilterDto,
} from '../dto/requests/get-lease.dto';
import { indexOf } from 'lodash';
//import { UserProfile } from "@app/common/database/entities/user-profile.entity";

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
	constructor(manager: EntityManager) {
		super(Lease, manager);
	}

	async createLease(lease: CreateLeaseDto, isDraft: boolean): Promise<Lease> {
		try {
			let createdLease: Lease;
			await this.manager.transaction(async (transactionalEntityManager) => {
				createdLease = await transactionalEntityManager.save(Lease, {
					name: lease.name,
					rentDueDay: lease.rentDueDay,
					rentAmount: lease.rentAmount,
					securityDeposit: lease.securityDeposit ?? null,
					rentDueMonth: lease.rentDueMonth ?? null,
					isDraft: isDraft,
					startDate: DateTime.fromISO(lease.startDate).toSQL(),
					endDate: DateTime.fromISO(lease.endDate).toSQL(),
					property: { uuid: lease.propertyUuId },
					status: lease.status ?? LeaseStatus.NEW,
					tenants: lease.tenants ?? null,
					paymentFrequency: lease.paymentFrequency,
				});
			});
			console.log('createdLease: ', createdLease);
			return createdLease;
		} catch (e) {
			this.logger.error(e);
		}
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
		}
	}
}
