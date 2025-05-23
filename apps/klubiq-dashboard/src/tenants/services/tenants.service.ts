import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { LeaseTenantRepository } from '@app/common/repositories/leases-tenant.repositiory';
import {
	ErrorMessages,
	PageDto,
	PageMetaDto,
	SharedClsStore,
	UserProfile,
	UserProfilesRepository,
} from '@app/common';
import { LeaseTenantResponseDto } from '../dto/responses/lease-tenant.dto';
import { GetTenantDto, TenantListDto } from '../dto/requests/get-tenant-dto';
import { ClsService } from 'nestjs-cls';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKeys, CacheTTl } from '@app/common/config/config.constants';
import { Util } from '@app/common/helpers/util';
import { UpdateTenantProfileDto } from '../dto/responses/update-tenant-profile';

@Injectable()
export class TenantsService {
	private readonly logger = new Logger(TenantsService.name);
	private readonly cacheTTL = CacheTTl.FIFTEEN_MINUTES;

	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private readonly leaseTenantRepository: LeaseTenantRepository,
		private readonly userProfileRepository: UserProfilesRepository,
		private readonly cls: ClsService<SharedClsStore>,
		private readonly util: Util,
	) {}

	private getcacheKey(organizationUuid: string, cacheKeyExtension?: string) {
		return `${organizationUuid}:${CacheKeys.TENANT}${cacheKeyExtension ? `:${cacheKeyExtension}` : ''}`;
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
			const cacheKey = this.getcacheKey(
				this.cls.get('currentUser').organizationId,
				`${CacheKeys.LEASE}:${leaseId}`,
			);
			const cachedTenants =
				await this.cacheManager.get<LeaseTenantResponseDto[]>(cacheKey);
			if (cachedTenants) {
				return cachedTenants;
			}
			const tenants = await this.leaseTenantRepository.findByLeaseId(leaseId);
			await this.cacheManager.set(cacheKey, tenants, this.cacheTTL);
			return tenants;
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

			const cacheKey = this.getcacheKey(
				currentUser.organizationId,
				this.cls.get('requestUrl'),
			);
			const cachedTenants =
				await this.cacheManager.get<PageDto<TenantListDto>>(cacheKey);
			if (cachedTenants) {
				return cachedTenants;
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
			const tenantsPageData = new PageDto(entities, pageMetaDto);
			await this.cacheManager.set(cacheKey, tenantsPageData, this.cacheTTL);
			await this.util.updateOrganizationResourceCacheKeys(
				currentUser.organizationId,
				CacheKeys.TENANT,
				cacheKey,
			);
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

	async getTenantInfo(): Promise<any> {
		try {
			const currentUser = this.cls.get('currentUser');
			if (currentUser.organizationRole != 'Tenant') {
				throw new ForbiddenException('Unauthorized');
			}
			return await this.leaseTenantRepository.getTenantByProfileUuid(
				currentUser.kUid,
			);
		} catch (error) {
			throw error;
		}
	}

	async updateTenantProfile(
		profileId: string,
		updateDto: UpdateTenantProfileDto,
	): Promise<UserProfile> {
		try {
			return await this.userProfileRepository.updateTenantProfile(
				profileId,
				updateDto,
			);
		} catch (error) {
			throw error;
		}
	}
}
