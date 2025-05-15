import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { LeaseTenantRepository } from '@app/common/repositories/leases-tenant.repositiory';
import {
	ErrorMessages,
	PageDto,
	PageMetaDto,
	SharedClsStore,
} from '@app/common';
import { LeaseTenantResponseDto } from '../dto/responses/lease-tenant.dto';
import { GetTenantDto, TenantListDto } from '../dto/requests/get-tenant-dto';
import { ClsService } from 'nestjs-cls';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TenantsService {
	private readonly logger = new Logger(TenantsService.name);
	private readonly cacheKeyPrefix = 'tenants';
	private readonly cacheTTL = 900000;

	constructor(
		@InjectRepository(LeaseTenantRepository)
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly leaseTenantRepository: LeaseTenantRepository,
		private readonly cls: ClsService<SharedClsStore>,
	) {}

	private async updateOrgTenantsCacheKeys(cacheKey: string) {
		const currentUser = this.cls.get('currentUser');
		const tenantListKeys =
			(await this.cacheManager.get<string[]>(
				`${currentUser.organizationId}:getTenantListKeys`,
			)) || [];
		await this.cacheManager.set(
			`${currentUser.organizationId}:getTenantListKeys`,
			[...tenantListKeys, cacheKey],
			this.cacheTTL,
		);
	}

	private async mapTenantEntityToTenantListDto(
		tenantEntities: any[],
	): Promise<TenantListDto[]> {
		const tenantListDto = plainToInstance(
			TenantListDto,
			tenantEntities.map((tenantEntity) => {
				const tenant = tenantEntity.__tenant__;
				const profile = tenant?.__profile__;
				return {
					uuid: tenantEntity.uuid,
					tenantId: tenantEntity.tenantId,
					organizationUuid: tenantEntity.organizationUuid,
					companyName: tenant?.companyName ?? null,
					isActive: tenant?.isActive ?? null,
					firstName: profile?.firstName ?? null,
					lastName: profile?.lastName ?? null,
					email: profile?.email ?? null,
					phoneNumber: profile?.phoneNumber ?? null,
					isKYCVerified: profile?.isKYCVerified ?? null,
					profilePicUrl: profile?.profilePicUrl ?? null,
					gender: profile?.gender ?? null,
					dateOfBirth: profile?.dateOfBirth ?? null,
					street: profile?.street ?? null,
					city: profile?.city ?? null,
					state: profile?.state ?? null,
					country: profile?.country ?? null,
					postalCode: profile?.postalCode ?? null,
				};
			}),
			{ excludeExtraneousValues: true },
		);

		return tenantListDto;
	}

	async getAllTenants(
		getTenantDto?: GetTenantDto,
	): Promise<PageDto<LeaseTenantResponseDto>> {
		try {
			const [entities, count] =
				await this.leaseTenantRepository.findAllLeasesTenant(getTenantDto);
			const pageMetaDto = new PageMetaDto({
				itemCount: count,
				pageOptionsDto: getTenantDto,
			});
			const tenantPageData: any = new PageDto(entities, pageMetaDto);
			return tenantPageData;
		} catch (error) {
			throw error;
		}
	}

	async getSingleTenant(id: string) {
		try {
			return this.leaseTenantRepository.getTenantById(id);
		} catch (error) {
			throw error;
		}
	}

	async getLeaseById(leaseId: string): Promise<LeaseTenantResponseDto[]> {
		try {
			return this.leaseTenantRepository.findByLeaseId(leaseId);
		} catch (error) {
			throw error;
		}
	}

	async getOrganizationTenants(getTenantDto?: GetTenantDto) {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) {
				throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			}

			const [entities, count] =
				await this.leaseTenantRepository.organizationTenants(
					currentUser.organizationId,
					getTenantDto,
				);

			const pageMetaDto = new PageMetaDto({
				itemCount: count,
				pageOptionsDto: getTenantDto,
			});
			const mappedEntities =
				await this.mapTenantEntityToTenantListDto(entities);
			console.log({ mappedEntities });

			const tenantsPageData = new PageDto(mappedEntities, pageMetaDto);
			return tenantsPageData;
		} catch (error) {
			throw error;
		}
	}

	async removeTenantFromOrganization(tenantId: string): Promise<void> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser || !currentUser.organizationId) {
				throw new ForbiddenException('Unauthorized');
			}

			await this.leaseTenantRepository.removeTenantFromOrganization(
				tenantId,
				currentUser.organizationId,
			);

			this.logger.log(
				`Tenant ${tenantId} removed from org ${currentUser.organizationId}`,
			);
		} catch (error) {
			this.logger.error(`Error removing tenant ${tenantId}: ${error.message}`);
			throw error;
		}
	}

	async removeTenantFromLease(
		tenantId: string,
		leaseId: string,
	): Promise<void> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser || !currentUser.organizationId) {
				throw new ForbiddenException('Unauthorized');
			}

			await this.leaseTenantRepository.removeTenantFromLease(tenantId, leaseId);
		} catch (error) {
			this.logger.error(`Error removing tenant ${tenantId}: ${error.message}`);
			throw error;
		}
	}
}
