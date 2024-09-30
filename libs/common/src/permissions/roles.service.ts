import { Inject, Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Role } from '../database/entities/role.entity';
import {
	OrgRoleResponseDto,
	ViewSystemRoleDto,
} from '../dto/responses/org-role.dto';
import {
	CreateRoleDto,
	CreateRoleFeaturePermission,
	UpdateRoleDto,
	UpdateRoleFeaturePermissionDto,
} from '../dto/requests/role.dto';
import { RolesRepository } from '../repositories/roles.repository';
import { OrganizationRolesRepository } from '../repositories/organization-roles.repository';
import { CacheKeys } from '../config/config.constants';
import { OrganizationRole } from '../database/entities/organization-role.entity';

@Injectable()
export class RolesService {
	private readonly logger = new Logger(RolesService.name);
	private readonly orgRoleCacheKey = CacheKeys.ORG_ROLES;
	private readonly systemRoleCacheKey = CacheKeys.SYSTEM_ROLES;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private rolesRepository: RolesRepository,
		private orgRolesRepository: OrganizationRolesRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
	) {}

	//#region SYSTEM ROLES
	async getSystemRoles(): Promise<ViewSystemRoleDto[]> {
		try {
			const cachedData = await this.cacheService.getCache<ViewSystemRoleDto>(
				this.systemRoleCacheKey,
			);
			if (cachedData) return cachedData;
			const roles = await this.rolesRepository.findAll();

			const data = await this.mapper.mapArrayAsync(
				roles,
				Role,
				ViewSystemRoleDto,
			);
			await this.cacheService.setCache(data, this.systemRoleCacheKey);
			return data;
		} catch (error) {
			this.logger.error('Error getting system roles', error);
			throw error;
		}
	}

	async getSystemRoleById(id: number): Promise<ViewSystemRoleDto> {
		try {
			const cachedData =
				await this.cacheService.getCacheByIdentifier<ViewSystemRoleDto>(
					this.systemRoleCacheKey,
					'id',
					id,
				);
			if (!cachedData) {
				const systemRole = await this.rolesRepository.findOneWithId({ id });
				const data = await this.mapper.mapAsync(
					systemRole,
					Role,
					ViewSystemRoleDto,
				);
				await this.cacheService.setCache(data, this.systemRoleCacheKey);
				return data;
			}
			return cachedData;
		} catch (error) {
			this.logger.error('Error getting system role by id', error);
			throw error;
		}
	}

	async createSystemRole(
		createRoleDto: CreateRoleDto,
	): Promise<ViewSystemRoleDto> {
		try {
			const systemRole = await this.rolesRepository.createEntity(createRoleDto);
			const data = await this.mapper.mapAsync(
				systemRole,
				Role,
				ViewSystemRoleDto,
			);
			await this.cacheService.updateCacheAfterCreate<ViewSystemRoleDto>(
				this.systemRoleCacheKey,
				data,
			);
			return data;
		} catch (error) {
			this.logger.error('Error creating system role', error);
			throw error;
		}
	}

	async updateSystemRole(
		id: number,
		updateDto: UpdateRoleDto,
	): Promise<ViewSystemRoleDto> {
		try {
			await this.rolesRepository.update({ id }, updateDto);
			const updated =
				await this.cacheService.updateCacheAfterUpsert<ViewSystemRoleDto>(
					this.systemRoleCacheKey,
					'id',
					id,
					updateDto,
				);
			if (!updated) {
				const updatedRole = await this.rolesRepository.findOneWithId({ id });
				return await this.mapper.mapAsync(updatedRole, Role, ViewSystemRoleDto);
			}
			return updated;
		} catch (error) {
			this.logger.error('Error updating system role', error);
			throw error;
		}
	}

	async deleteSystemRole(id: number): Promise<boolean> {
		try {
			const deleted = await this.rolesRepository.delete({ id });
			await this.cacheService.updateCacheAfterdelete<ViewSystemRoleDto>(
				this.systemRoleCacheKey,
				'id',
				id,
			);
			return deleted.affected == 1;
		} catch (error) {
			this.logger.error('Error deleting system role', error);
			throw error;
		}
	}
	//#endregion

	//#region ORG ROLES
	async getOrgRoles(): Promise<OrgRoleResponseDto[]> {
		try {
			const cachedData = await this.cacheService.getCache<OrgRoleResponseDto>(
				this.orgRoleCacheKey,
			);
			if (cachedData) return cachedData;
			const roles = await this.orgRolesRepository.findAll();
			const data = await this.mapper.mapArrayAsync(
				roles,
				OrganizationRole,
				OrgRoleResponseDto,
			);
			await this.cacheService.setCache(data, this.orgRoleCacheKey);
			return data;
		} catch (error) {
			this.logger.error('Error getting org roles', error);
			throw error;
		}
	}

	async getOrgRoleById(id: number): Promise<OrgRoleResponseDto> {
		try {
			const cachedData =
				await this.cacheService.getCacheByIdentifier<OrgRoleResponseDto>(
					this.orgRoleCacheKey,
					'id',
					id,
				);
			if (!cachedData) {
				const orgRole = await this.orgRolesRepository.findOneWithId({ id });
				const data = await this.mapper.mapAsync(
					orgRole,
					OrganizationRole,
					OrgRoleResponseDto,
				);
				await this.cacheService.setCache(data, this.orgRoleCacheKey);
				return data;
			}
			return cachedData;
		} catch (error) {
			this.logger.error('Error getting org role by id', error);
			throw error;
		}
	}

	async createOrgRole(
		createRoleDto: CreateRoleFeaturePermission,
	): Promise<OrgRoleResponseDto> {
		try {
			const created =
				await this.orgRolesRepository.createRoleWithFeaturePermission(
					createRoleDto,
				);
			const data = await this.mapper.mapAsync(
				created,
				OrganizationRole,
				OrgRoleResponseDto,
			);
			await this.cacheService.updateCacheAfterCreate<OrgRoleResponseDto>(
				this.orgRoleCacheKey,
				data,
			);
			return data;
		} catch (error) {
			this.logger.error('Error creating org role', error);
			throw error;
		}
	}

	async updateOrgRole(
		id: number,
		updateDto: UpdateRoleFeaturePermissionDto,
	): Promise<OrgRoleResponseDto> {
		try {
			const updatedRole =
				await this.orgRolesRepository.saveRoleFeaturePermissions(id, updateDto);
			const data = await this.mapper.mapAsync(
				updatedRole,
				OrganizationRole,
				OrgRoleResponseDto,
			);
			await this.cacheService.updateCacheAfterUpsert<OrgRoleResponseDto>(
				this.orgRoleCacheKey,
				'id',
				id,
				data,
			);
			return data;
		} catch (error) {
			this.logger.error(`Error updating org role: ${id}`, error);
			throw error;
		}
	}

	async deleteOrgRole(id: number): Promise<void> {
		try {
			await this.orgRolesRepository.deleteRoleWithFeaturePermission(id);
			await this.cacheService.updateCacheAfterdelete<OrgRoleResponseDto>(
				this.orgRoleCacheKey,
				'id',
				id,
			);
		} catch (error) {
			this.logger.error('Error deleting org role', error);
			throw error;
		}
	}
	//#endregion
}
