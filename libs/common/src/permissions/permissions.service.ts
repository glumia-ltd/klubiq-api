import { Inject, Injectable, Logger } from '@nestjs/common';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from '../services/cache.service';
import { Permission } from '../database/entities/permission.entity';
import {
	CreatePermissionDto,
	UpdatePermissionDto,
} from '../dto/requests/permission-requests.dto';
import { CacheKeys } from '@app/common/config/config.constants';

@Injectable()
export class PermissionsService {
	private readonly logger = new Logger(PermissionsService.name);
	private readonly permissionsCacheKey = CacheKeys.PERMISSIONS;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		private readonly permissionsRepository: PermissionsRepository,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	// gets all app permissions
	async getPermissions(): Promise<Permission[]> {
		try {
			const cachedPermissionList = await this.cacheService.getCache<Permission>(
				this.permissionsCacheKey,
			);
			if (!cachedPermissionList) {
				const permissions = await this.permissionsRepository.findAll();
				await this.cacheService.setCache<Permission[]>(
					permissions,
					this.permissionsCacheKey,
				);
				return permissions;
			}
			return cachedPermissionList;
		} catch (err) {
			this.logger.error('Error getting Permissions list', err);
			throw err;
		}
	}

	// gets a permission by Id
	async getPermissionById(id: number): Promise<Permission> {
		try {
			const cachedPermission =
				await this.cacheService.getCacheByIdentifier<Permission>(
					this.permissionsCacheKey,
					'id',
					id,
				);
			if (!cachedPermission) {
				const permission = await this.permissionsRepository.findOneWithId({
					id,
				});
				await this.cacheService.setCache<Permission>(
					permission,
					this.permissionsCacheKey,
				);
				return permission;
			}
			return cachedPermission;
		} catch (err) {
			this.logger.error(`Error getting permission by Id: ${id}`, err);
			throw err;
		}
	}

	// This creates a new permission
	async createPermission(createDto: CreatePermissionDto): Promise<Permission> {
		try {
			const permission =
				await this.permissionsRepository.createEntity(createDto);
			await this.cacheService.updateCacheAfterCreate<Permission>(
				this.permissionsCacheKey,
				permission,
			);
			return permission;
		} catch (err) {
			this.logger.error('Error creating permission', err);
			throw new Error(`Error creating permission. Error: ${err}`);
		}
	}

	// This updates a permission
	async update(
		id: number,
		updateDto: UpdatePermissionDto,
	): Promise<Permission> {
		try {
			await this.permissionsRepository.update({ id }, updateDto);
			const updated =
				await this.cacheService.updateCacheAfterUpsert<Permission>(
					this.permissionsCacheKey,
					'id',
					id,
					updateDto,
				);
			if (!updated) {
				const updatedPermission =
					await this.permissionsRepository.findOneWithId({ id });
				return updatedPermission;
			}
			return updated;
		} catch (err) {
			this.logger.error('Error updating permission', err);
			throw new Error(`Error updating permission. Error: ${err}`);
		}
	}

	// This deletes a permission
	async delete(id: number): Promise<void> {
		try {
			await this.permissionsRepository.delete({ id });
			await this.cacheService.updateCacheAfterdelete<Permission>(
				this.permissionsCacheKey,
				'id',
				id,
			);
		} catch (err) {
			this.logger.error('Error deleting permission', err);
			throw new Error(`Error deleting permission. Error: ${err}`);
		}
	}
}
