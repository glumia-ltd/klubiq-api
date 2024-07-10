import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ILeaseService } from '../interfaces/lease.interface';
import { CreateLeaseDto } from '../dto/requests/create-lease.dto';
import { LeaseDto } from '../dto/responses/view-lease.dto';
import { ClsService } from 'nestjs-cls';
import {
	ErrorMessages,
	Lease,
	PageDto,
	PageMetaDto,
	SharedClsStore,
	UserRoles,
} from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LeaseRepository } from '../repositories/lease.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UpdateLeaseDto } from '../dto/requests/update-lease.dto';
import { GetLeaseDto } from '../dto/requests/get-lease.dto';
@Injectable()
export class LeaseService implements ILeaseService {
	private readonly logger = new Logger(LeaseService.name);
	private readonly cacheKeyPrefix = 'leases';
	private readonly cacheTTL = 60000;

	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@InjectRepository(LeaseRepository)
		private readonly leaseRepository: LeaseRepository,
	) {}
	async getOrganizationLeases(
		getLeaseDto?: GetLeaseDto,
	): Promise<PageDto<LeaseDto>> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		const cacheKey = `${this.cacheKeyPrefix}-${currentUser.organizationId}/${this.cls.get('requestUrl')}`;
		const cachedLeases =
			await this.cacheManager.get<PageDto<LeaseDto>>(cacheKey);
		if (cachedLeases) return cachedLeases;
		const [entities, count] = await this.leaseRepository.getOrganizationLeases(
			currentUser.organizationId,
			currentUser.uid,
			getLeaseDto,
			currentUser.organizationRole === UserRoles.ORG_OWNER,
		);
		const pageMetaDto = new PageMetaDto({
			itemCount: count,
			pageOptionsDto: getLeaseDto,
		});
		const mappedEntities = await this.mapper.mapArrayAsync(
			entities,
			Lease,
			LeaseDto,
		);
		const leaseData = new PageDto(mappedEntities, pageMetaDto);
		await this.cacheManager.set(cacheKey, leaseData, this.cacheTTL);
		return leaseData;
	}
	async getAllPropertyLeases(propertyUuId: string): Promise<LeaseDto[]> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		const cacheKey = `${this.cacheKeyPrefix}/property/${propertyUuId}`;
		const cachedLeases = await this.cacheManager.get<LeaseDto[]>(cacheKey);
		if (cachedLeases) return cachedLeases;
		const leases = await this.leaseRepository.getPropertyLeases(
			propertyUuId,
			currentUser.organizationId,
		);

		const mappedLeases = await this.mapper.mapArrayAsync(
			leases,
			Lease,
			LeaseDto,
		);
		await this.cacheManager.set(cacheKey, mappedLeases, this.cacheTTL);
		return mappedLeases;
	}

	async getLeaseById(id: number): Promise<LeaseDto> {
		const cacheKey = `${this.cacheKeyPrefix}/${id}`;
		const cachedLease = await this.cacheManager.get<LeaseDto>(cacheKey);
		if (cachedLease) return cachedLease;
		const lease = await this.leaseRepository.getLeaseById(id);
		const mappedLease = await this.mapper.mapAsync(lease, Lease, LeaseDto);
		await this.cacheManager.set(cacheKey, mappedLease, this.cacheTTL);
		return mappedLease;
	}

	async updateLeaseById(
		id: number,
		leaseDto: UpdateLeaseDto,
	): Promise<LeaseDto> {
		const updatedLease = await this.leaseRepository.updateLease(id, leaseDto);
		const mappedLease = await this.mapper.mapAsync(
			updatedLease,
			Lease,
			LeaseDto,
		);
		return mappedLease;
	}

	async createLease(leaseDto: CreateLeaseDto): Promise<LeaseDto> {
		const lease = await this.leaseRepository.createLease(leaseDto, false);
		const mappedLease = await this.mapper.mapAsync(lease, Lease, LeaseDto);
		return mappedLease;
	}
}
