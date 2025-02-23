import { Inject, Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateRoleFeaturePermissionDto } from '../dto/requests/permission-requests.dto';
import { CacheKeys } from '../config/config.constants';
import { RoleFeaturePermissionsRepository } from '../repositories/roles-features-permission.repository';
import { RoleFeaturePermissions } from '../database/entities/role-feature-permission.entity';

@Injectable()
export class RoleFeaturePermissionService {
	private readonly logger = new Logger(RoleFeaturePermissionService.name);
	private readonly cacheKey = CacheKeys.ROLE_FEATURE_PERMISSIONS;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly roleFeaturePermissionRepository: RoleFeaturePermissionsRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async getRoleFeaturePermissions(): Promise<RoleFeaturePermissions[]> {
		try {
			const cachedData =
				await this.cacheService.getCache<RoleFeaturePermissions>(this.cacheKey);
			if (cachedData) return cachedData;
			const roleFeaturePermissions =
				await this.roleFeaturePermissionRepository.findAll();
			await this.cacheService.setCache(roleFeaturePermissions, this.cacheKey);
			return roleFeaturePermissions;
		} catch (err) {
			this.logger.error('Error getting RoleFeaturePermissions', err);
			throw new Error(`Error getting RoleFeaturePermissions. Error: ${err}`);
		}
	}

	async getRoleFeaturePermissionsById(
		id: number,
	): Promise<RoleFeaturePermissions> {
		try {
			const cachedData =
				await this.cacheService.getCacheByIdentifier<RoleFeaturePermissions>(
					this.cacheKey,
					'id',
					id,
				);
			if (!cachedData) {
				const roleFeaturePermission =
					await this.roleFeaturePermissionRepository.getRoleFeaturePermissions(
						id,
					);
				await this.cacheService.setCache(roleFeaturePermission, this.cacheKey);
				return roleFeaturePermission;
			}
			return cachedData;
		} catch (err) {
			this.logger.error('Error getting FeaturePermission by id', err);
			throw new Error(`Error getting FeaturePermission by id.. Error: ${err}`);
		}
	}

	async createRoleFeaturePermission(
		createDto: CreateRoleFeaturePermissionDto,
	): Promise<RoleFeaturePermissions> {
		try {
			const dataCreated =
				await this.roleFeaturePermissionRepository.createRoleFeaturePermissions(
					createDto,
				);
			await this.cacheService.updateCacheAfterCreate<RoleFeaturePermissions>(
				this.cacheKey,
				dataCreated,
			);
			return dataCreated;
		} catch (err) {
			this.logger.error('Error creating FeaturePermissions', err);
			throw new Error(`Error creating FeaturePermissions. Error: ${err}`);
		}
	}

	async deleteFeaturePermission(id: number): Promise<void> {
		try {
			await this.roleFeaturePermissionRepository.deleteRoleFeaturePermissions(
				id,
			);
			await this.cacheService.updateCacheAfterdelete<RoleFeaturePermissions>(
				this.cacheKey,
				'id',
				id,
			);
		} catch (err) {
			this.logger.error('Error creating FeaturePermissions', err);
			throw new Error(`Error creating FeaturePermissions. Error: ${err}`);
		}
	}
}
