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
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private orgRolesRepository: OrganizationRolesRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
	) {}

	private getcacheKey(cacheKeyExtension?: string) {
		return `${CacheKeys.ORG_ROLES}${cacheKeyExtension ? `:${cacheKeyExtension}` : ''}`;
	}
	//#region ORG ROLES

	async createRole(createRoleDto: CreateRoleDto): Promise<OrganizationRole> {
		try {
			const orgRole = await this.orgRolesRepository.createRole(createRoleDto);
			const cacheKey = this.getcacheKey();
			await this.cacheService.updateCacheAfterCreate<OrganizationRole>(
				cacheKey,
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
			const cacheKey = this.getcacheKey(`role:${id}`);
			const cachedData =
				await this.cacheService.getItem<OrganizationRole>(cacheKey);
			if (!cachedData) {
				const role = await this.orgRolesRepository.getRoleById(id);
				if (!role) {
					throw new NotFoundException(`Role with ID "${id}" not found`);
				}
				await this.cacheService.setCache(role, cacheKey);
				return role;
			}
			return cachedData;
		} catch (error) {
			this.logger.error('Error getting org role by id', error);
			throw error;
		}
	}

	async getRoleByName(name: string): Promise<OrganizationRole> {
		try {
			const cacheKey = this.getcacheKey(`role:${name}`);
			const cachedData =
				await this.cacheService.getItem<OrganizationRole>(cacheKey);
			if (!cachedData) {
				const role = await this.orgRolesRepository.getRoleByName(name);
				if (!role) {
					throw new NotFoundException(`Role with name "${name}" not found`);
				}
				await this.cacheService.setCache(role, cacheKey);
				return role;
			}
			return cachedData;
		} catch (error) {
			this.logger.error('Error getting org role by name', error);
			throw error;
		}
	}

	async getAllRoles(): Promise<OrganizationRole[]> {
		try {
			const cacheKey = this.getcacheKey();
			const cachedData =
				await this.cacheService.getCache<OrganizationRole>(cacheKey);
			if (cachedData) {
				return cachedData;
			}
			const roles = await this.orgRolesRepository.getAllRoles();
			await this.cacheService.setCache(roles, cacheKey);
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
			const cacheKey = this.getcacheKey(`role:${id}`);
			const role = await this.orgRolesRepository.updateRole(id, updateRoleDto);
			if (!role) {
				throw new NotFoundException(`Role with ID "${id}" not found`);
			}
			await this.cacheService.updateCacheAfterUpsert<OrganizationRole>(
				cacheKey,
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
