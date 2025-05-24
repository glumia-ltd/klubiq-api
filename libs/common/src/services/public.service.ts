import { Inject, Injectable, Logger } from '@nestjs/common';

import { PropertyDetailsDto } from 'apps/klubiq-dashboard/src/properties/dto/responses/property-details.dto';

import { PropertiesService } from 'apps/klubiq-dashboard/src/properties/services/properties.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TenantRepository } from '../repositories/tenant.repository';
import { ClsService } from 'nestjs-cls';
import { SharedClsStore } from '../dto/public/shared-clsstore';
import { ActiveUserData } from '@app/auth/types/firebase.types';
import { CacheKeys, CacheTTl } from '../config/config.constants';
import { TenantDto } from '../dto/responses/tenant.dto';
import { plainToInstance } from 'class-transformer';
import { Util } from '../helpers/util';

@Injectable()
export class PublicService {
	private readonly logger = new Logger(PublicService.name);
	private currentUser: ActiveUserData;
	constructor(
		private propertiesService: PropertiesService,
		private readonly tenantRepository: TenantRepository,
		private readonly cls: ClsService<SharedClsStore>,
		private readonly util: Util,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async getOrganizationPropertiesViewList(): Promise<PropertyDetailsDto[]> {
		try {
			const properties =
				await this.propertiesService.getPropertyGroupedUnitsByOrganization();
			return properties;
		} catch (error) {
			this.logger.error('Error getting organization properties', error);
			return [];
		}
	}
	async getOrganizationTenants(orgUuid: string): Promise<TenantDto[]> {
		try {
			this.currentUser = this.cls.get('currentUser');
			if (!orgUuid || orgUuid !== this.currentUser.organizationId) {
				return [];
			}
			const cacheKey = this.util.getcacheKey(
				this.currentUser.organizationId,
				CacheKeys.ORGANIZATION_TENANTS,
			);
			const cachedTenants = await this.cacheManager.get<TenantDto[]>(cacheKey);
			if (!cachedTenants) {
				const org_tenants =
					await this.tenantRepository.getOrganizationTenants(orgUuid);
				const tenants = await this.getMappedTenants(org_tenants);
				await this.cacheManager.set(cacheKey, tenants, CacheTTl.ONE_HOUR);
				return tenants;
			}
			return cachedTenants;
		} catch (error) {
			this.logger.error('Error getting organization tenants', error);
			return [];
		}
	}

	async resetCache() {
		const { stores } = this.cacheManager;
		for (const store of stores) {
			await store.store.clear();
		}
	}

	private async getMappedTenants(orgTenants: any[]): Promise<TenantDto[]> {
		return await Promise.all(
			orgTenants.map(async (orgTenant) => {
				const tenant = await orgTenant.tenant;
				const profile = await tenant.profile;
				return plainToInstance(
					TenantDto,
					{
						id: tenant.id,
						title: profile.title,
						email: profile.email,
						firstName: profile.firstName,
						lastName: profile.lastName,
						companyName: tenant.companyName,
					},
					{ excludeExtraneousValues: true },
				);
			}),
		);
	}
}
