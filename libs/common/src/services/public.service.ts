import { Inject, Injectable, Logger } from '@nestjs/common';

import { PropertyDetailsDto } from 'apps/klubiq-dashboard/src/properties/dto/responses/property-details.dto';

import { PropertiesService } from 'apps/klubiq-dashboard/src/properties/services/properties.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TenantRepository } from '../repositories/tenant.repository';
import { ClsService } from 'nestjs-cls';
import { SharedClsStore } from '../dto/public/shared-clsstore';
import { ActiveUserData } from '@app/auth/types/firebase.types';
import { CacheKeys } from '../config/config.constants';
import { OrganizationTenants } from '../database/entities/organization-tenants.entity';
import { TenantDto } from '../dto/responses/tenant.dto';
import { map } from 'lodash';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PublicService {
	private readonly logger = new Logger(PublicService.name);
	private readonly cacheKey = CacheKeys.ORGANIZATION_TENANTS;
	private currentUser: ActiveUserData;
	constructor(
		private propertiesService: PropertiesService,
		private readonly tenantRepository: TenantRepository,
		private readonly cls: ClsService<SharedClsStore>,
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
			if (!orgUuid || orgUuid !== this.currentUser.organizationId) return [];
			const cachedTenants = await this.cacheManager.get<TenantDto[]>(
				`${this.cacheKey}/${this.currentUser.organizationId}`,
			);
			if (!cachedTenants) {
				const org_tenants =
					await this.tenantRepository.getOrganizationTenants(orgUuid);
				const tenants = await this.getMappedTenants(org_tenants);
				await this.cacheManager.set(
					`${this.cacheKey}/${this.currentUser.organizationId}`,
					tenants,
					86400,
				);
				return tenants;
			}
			return cachedTenants;
		} catch (error) {
			this.logger.error('Error getting organization tenants', error);
			return [];
		}
	}

	async resetCache() {
		await this.cacheManager.reset();
	}

	private async getMappedTenants(
		orgTenants: OrganizationTenants[],
	): Promise<TenantDto[]> {
		const tenants = map(orgTenants, async (orgTenant) => {
			const tenant = await orgTenant.tenant;
			return plainToInstance(
				TenantDto,
				{
					id: tenant.id,
					title: tenant.title,
					email: tenant.email,
					firstName: tenant.firstName,
					lastName: tenant.lastName,
					companyName: tenant.companyName,
				},
				{ excludeExtraneousValues: true },
			);
		});
		return Promise.all(tenants);
	}
}
