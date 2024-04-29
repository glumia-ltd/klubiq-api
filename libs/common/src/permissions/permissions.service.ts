import { Inject, Injectable, Logger } from '@nestjs/common';
// import { EntityManager } from 'typeorm';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { OrganizationRolesRepository } from '../repositories/organization-roles.repository';
import { FeaturesRepository } from '../repositories/features.repository';
import { OrganizationRole } from '../database/entities/organization-role.entity';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ViewOrgRoleDto } from '../dto/responses/org-role.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from '../services/cache.service';
import { ViewPermissionDto } from '../dto/responses/feature-permission.dto';
import { Permission } from '../database/entities/permission.entity';
import {
	CreatePermissionDto,
	UpdatePermissionDto,
} from '../dto/requests/permission-requests.dto';

@Injectable()
export class PermissionsService {
	private readonly logger = new Logger(PermissionsService.name);
	private readonly rolesCacheKey = 'roles';
	private readonly permissionsCacheKey = 'permissions';
	private readonly cacheService = new CacheService(
		60 * 60 * 24,
		this.cacheManager,
	);
	constructor(
		@InjectMapper() private readonly mapper: Mapper,
		private readonly permissionsRepository: PermissionsRepository,
		private readonly organizationRoleRepository: OrganizationRolesRepository,
		private readonly featuresRepository: FeaturesRepository,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async getOrgRoles(): Promise<ViewOrgRoleDto[]> {
		try {
			const cachedData = await this.cacheService.getCache<ViewOrgRoleDto>(
				this.rolesCacheKey,
			);
			if (cachedData) return cachedData;
			const roles = await this.organizationRoleRepository.findAll();
			const data = await this.mapper.mapArrayAsync(
				roles,
				OrganizationRole,
				ViewOrgRoleDto,
			);
			await this.cacheService.setCache(data, this.rolesCacheKey);
			return data;
		} catch (err) {
			throw err;
		}
	}
	// gets all app permissions
	async getPermissions(): Promise<ViewPermissionDto[]> {
		try {
			const cachedPermissionList =
				await this.cacheService.getCache<ViewPermissionDto>(
					this.permissionsCacheKey,
				);
			if (!cachedPermissionList) {
				const permissions = await this.permissionsRepository.findAll();
				const data = await this.mapper.mapArrayAsync(
					permissions,
					Permission,
					ViewPermissionDto,
				);
				await this.cacheService.setCache<ViewPermissionDto[]>(
					data,
					this.permissionsCacheKey,
				);
				return data;
			}
			return cachedPermissionList;
		} catch (err) {
			this.logger.error('Error getting Permissions list', err);
			throw err;
		}
	}

	// gets a permission by Id
	async getPermissionById(id: number): Promise<ViewPermissionDto> {
		try {
			const cachedPermission =
				await this.cacheService.getCacheByIdentifier<ViewPermissionDto>(
					this.permissionsCacheKey,
					'id',
					id,
				);
			if (!cachedPermission) {
				const permission = await this.permissionsRepository.findOneWithId({
					id,
				});
				const viewData = this.mapper.map(
					permission,
					Permission,
					ViewPermissionDto,
				);
				return viewData;
			}
			return cachedPermission;
		} catch (err) {
			this.logger.error(`Error getting permission by Id: ${id}`, err);
			throw err;
		}
	}

	// This creates a new permission
	async createPermission(
		createDto: CreatePermissionDto,
	): Promise<ViewPermissionDto> {
		try {
			const permission =
				await this.permissionsRepository.createEntity(createDto);
			const viewData = this.mapper.map(
				permission,
				Permission,
				ViewPermissionDto,
			);
			await this.cacheService.updateCacheAfterCreate<ViewPermissionDto>(
				this.permissionsCacheKey,
				viewData,
			);
			return viewData;
		} catch (err) {
			this.logger.error('Error creating permission', err);
			throw new Error(`Error creating permission. Error: ${err}`);
		}
	}

	// This updates a permission
	async update(
		id: number,
		updateDto: UpdatePermissionDto,
	): Promise<ViewPermissionDto> {
		try {
			await this.permissionsRepository.update({ id }, updateDto);
			const updated =
				await this.cacheService.updateCacheAfterUpsert<ViewPermissionDto>(
					this.permissionsCacheKey,
					'id',
					id,
					updateDto,
				);
			if (!updated) {
				const updatedPermission =
					await this.permissionsRepository.findOneWithId({ id });
				return this.mapper.map(
					updatedPermission,
					Permission,
					ViewPermissionDto,
				);
			}
			return updated;
		} catch (err) {
			this.logger.error('Error updating permission', err);
			throw new Error(`Error updating permission. Error: ${err}`);
		}
	}

	// This deletes a permission
	async delete(id: number): Promise<boolean> {
		try {
			await this.cacheService.updateCacheAfterdelete<ViewPermissionDto>(
				this.permissionsCacheKey,
				'id',
				id,
			);
			const deleted = await this.permissionsRepository.delete({ id });
			return deleted.affected == 1;
		} catch (err) {
			this.logger.error('Error deleting permission', err);
			throw new Error(`Error deleting permission. Error: ${err}`);
		}
	}
}
