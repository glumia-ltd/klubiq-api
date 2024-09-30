import { Inject, Injectable, Logger } from '@nestjs/common';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from '../services/cache.service';
import { ViewPermissionDto } from '../dto/responses/feature-permission.dto';
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
