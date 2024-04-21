import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
// import { EntityManager } from 'typeorm';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { OrganizationRolesRepository } from '../repositories/organization-roles.repository';
import { FeaturesRepository } from '../repositories/features.repository';
import { OrganizationRole } from '../database/entities/organization-role.entity';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ViewOrgRoleDto } from '../dto/org-role.dto';

@Injectable()
export class PermissionsService {
	constructor(
		@InjectMapper() private readonly mapper: Mapper,
		private readonly permissionsRepository: PermissionsRepository,
		private readonly organizationRoleRepository: OrganizationRolesRepository,
		private readonly featuresRepository: FeaturesRepository,
		@Inject(CACHE_MANAGER) private cacheManager: CacheStore,
	) {}

	async getOrgRoles(): Promise<ViewOrgRoleDto[]> {
		try {
			const cachedRoles =
				await this.cacheManager.get<ViewOrgRoleDto[]>('roles');
			if (cachedRoles) {
				return cachedRoles;
			}
			const roles = await this.organizationRoleRepository.findAll();
			const data = this.mapper.mapArrayAsync(
				roles,
				OrganizationRole,
				ViewOrgRoleDto,
			);
			await this.cacheManager.set('roles', data);
			return data;
		} catch (err) {
			throw err;
		}
	}
}
