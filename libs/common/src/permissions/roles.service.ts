import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateRoleDto, UpdateRoleDto } from '../dto/requests/role.dto';
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
		private orgRolesRepository: OrganizationRolesRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
	) {}

	//#region ORG ROLES

	async createRole(createRoleDto: CreateRoleDto): Promise<OrganizationRole> {
		try {
			const orgRole = await this.orgRolesRepository.createRole(createRoleDto);
			await this.cacheService.updateCacheAfterCreate<OrganizationRole>(
				this.orgRoleCacheKey,
				orgRole,
			);
			return orgRole;
		} catch (error) {
			this.logger.error('Error creating org role', error);
			throw error;
		}
	}

	async getRoleById(id: number): Promise<OrganizationRole> {
		try {
			const cachedData =
				await this.cacheService.getCacheByIdentifier<OrganizationRole>(
					this.orgRoleCacheKey,
					'id',
					id,
				);
			if (!cachedData) {
				const role = await this.orgRolesRepository.getRoleById(id);
				if (!role) {
					throw new NotFoundException(`Role with ID "${id}" not found`);
				}
				await this.cacheService.setCache(role, this.orgRoleCacheKey);
				return role;
			}
			return cachedData;
		} catch (error) {
			this.logger.error('Error getting org role by id', error);
			throw error;
		}
	}

	async getAllRoles(): Promise<OrganizationRole[]> {
		try {
			const cachedData = await this.cacheService.getCache<OrganizationRole>(
				this.orgRoleCacheKey,
			);
			if (cachedData) return cachedData;
			const roles = await this.orgRolesRepository.getAllRoles();
			await this.cacheService.setCache(roles, this.orgRoleCacheKey);
			return roles;
		} catch (error) {
			this.logger.error('Error getting org roles', error);
			throw error;
		}
	}

	async updateRole(
		id: number,
		updateRoleDto: UpdateRoleDto,
	): Promise<OrganizationRole> {
		try {
			const role = await this.orgRolesRepository.updateRole(id, updateRoleDto);
			if (!role) {
				throw new NotFoundException(`Role with ID "${id}" not found`);
			}
			await this.cacheService.updateCacheAfterUpsert<OrganizationRole>(
				this.orgRoleCacheKey,
				'id',
				id,
				role,
			);
			return role;
		} catch (error) {
			this.logger.error('Error updating org role', error);
			throw error;
		}
	}

	async deleteRole(id: number): Promise<void> {
		try {
			const role = await this.getRoleById(id); // Check if role exists
			if (!role) {
				throw new NotFoundException(`Role with ID "${id}" not found`);
			}
			await this.orgRolesRepository.deleteRole(id);
			await this.cacheService.updateCacheAfterdelete<OrganizationRole>(
				this.orgRoleCacheKey,
				'id',
				id,
			);
		} catch (error) {
			this.logger.error('Error deleting system role', error);
			throw error;
		}
	}
	//#endregion
}
