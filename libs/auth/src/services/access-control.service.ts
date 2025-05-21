// src/services/access-control.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from '@app/common/database/entities/feature.entity';
import { Permission } from '@app/common/database/entities/permission.entity';
import { OrganizationUser } from '@app/common/database/entities/organization-user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import DataLoader from 'dataloader';
import { RoleFeaturePermissions } from '@app/common/database/entities/role-feature-permission.entity';
import { ApiDebugger } from '@app/common/helpers/debug-loggers';
import { CacheKeys, CacheTTl } from '@app/common/config/config.constants';
import KeyvRedis from '@keyv/redis';
@Injectable()
export class AccessControlService {
	private readonly logger = new Logger(AccessControlService.name);
	private roleFeaturePermissionLoader: DataLoader<
		string,
		RoleFeaturePermissions | null
	>;
	constructor(
		@Inject(CACHE_MANAGER) protected cacheManager: Cache,
		@InjectRepository(Feature)
		private readonly featureRepository: Repository<Feature>,
		@InjectRepository(Permission)
		private readonly permissionRepository: Repository<Permission>,
		@InjectRepository(RoleFeaturePermissions)
		private readonly roleFeaturePermissionsRepository: Repository<RoleFeaturePermissions>,
		@InjectRepository(OrganizationUser)
		private readonly organizationUserRepository: Repository<OrganizationUser>,
		private readonly apiDebugger: ApiDebugger,
	) {
		this.roleFeaturePermissionLoader = new DataLoader<
			string,
			RoleFeaturePermissions | null
		>(async (keys: string[]) => {
			// Batch load function that fetches multiple role-feature-permission entries at once.
			const results = await this.roleFeaturePermissionsRepository.find({
				where: keys.map((key) => {
					const [roleId, featureId, permissionId] = key.split('-').map(Number);
					return { roleId, featureId, permissionId };
				}),
			});
			// Ensure results are in the same order as the keys.
			return keys.map((key) => {
				const [roleId, featureId, permissionId] = key.split('-').map(Number);
				return (
					results.find(
						(result) =>
							result.roleId === roleId &&
							result.featureId === featureId &&
							result.permissionId === permissionId,
					) || null
				); // Return null if not found
			});
		});
	}

	private getcacheKey(cacheKeyExtension?: string, prefix?: string) {
		return `${prefix ? `${prefix}:` : ''}${CacheKeys.PERMISSION}${cacheKeyExtension ? `:${cacheKeyExtension}` : ''}`;
	}
	async hasPermission(
		userUuid: string,
		organizationUuid: string,
		featureName: string,
		permissionName: string,
	): Promise<boolean> {
		try {
			// 1. Construct the cache key.
			const cacheKey = this.getcacheKey(
				`${userUuid}:${organizationUuid}:${featureName}:${permissionName}`,
			);

			// 2. Check the cache.
			const cachedResult = await this.cacheManager.get<boolean>(cacheKey);
			if (cachedResult !== null && cachedResult !== undefined) {
				this.logger.debug(`Cache hit for key: ${cacheKey}`);
				return cachedResult;
			}

			// 3. If not in cache, perform the permission check.
			const hasPermission = await this.checkPermission(
				userUuid,
				organizationUuid,
				featureName,
				permissionName,
			);

			// 4. Store the result in the cache.
			await this.cacheManager.set(cacheKey, hasPermission, CacheTTl.ONE_HOUR); // Cache for 1 hour (adjust as needed)
			this.logger.debug(
				`Cache set for key: ${cacheKey} with value: ${hasPermission}`,
			);

			return hasPermission;
		} catch (error) {
			this.logger.error(
				`Error checking permission: ${error.message}`,
				error.stack,
			);
			return false; // Or re-throw the error if appropriate
		}
	}

	private async checkPermission(
		userUuid: string,
		organizationUuid: string,
		featureName: string,
		permissionName: string,
	): Promise<boolean> {
		// 1. Get the user's role within the organization.
		const organizationUser = await this.organizationUserRepository.findOne({
			where: {
				profile: { profileUuid: userUuid },
				organization: { organizationUuid },
			},
			relations: ['orgRole'], // Eager load the role.
		});

		if (!organizationUser || !organizationUser.orgRole) {
			return false; // User is not in the organization or has no role.
		}

		const roleId = organizationUser.orgRole.id;

		// 2.  Find the feature and permission IDs.
		const feature = await this.featureRepository.findOne({
			where: { name: featureName },
		});
		const permission = await this.permissionRepository.findOne({
			where: { name: permissionName },
		});

		if (!feature || !permission) {
			return false; // Feature or permission not found.
		}

		// 3. Use DataLoader to check if the role has the necessary permission for the feature.
		const cacheKey = `${roleId}-${feature.id}-${permission.id}`;
		const roleFeaturePermission =
			await this.roleFeaturePermissionLoader.load(cacheKey);

		return !!roleFeaturePermission;
	}

	async invalidateCache(
		userUuid: string,
		organizationUuid: string,
		featureName?: string,
		permissionName?: string,
	): Promise<void> {
		// Invalidate specific cache entries or all entries for a user/organization
		if (featureName && permissionName) {
			const cacheKey = this.getcacheKey(
				`${userUuid}:${organizationUuid}:${featureName}:${permissionName}`,
			);
			await this.cacheManager.del(cacheKey);
			this.logger.log(`Invalidated cache for key: ${cacheKey}`);
		} else {
			// Invalidate all permissions for a user/organization (more aggressive, use sparingly)
			// This is a simplified example and might need refinement based on your cache strategy.
			const store = this.cacheManager.stores[0].store as KeyvRedis<any>;
			for await (const [key, value] of store.iterator()) {
				if (
					key.startsWith(
						`${CacheKeys.PERMISSION}:${userUuid}:${organizationUuid}`,
					) &&
					value
				) {
					await this.cacheManager.del(key);
				}
			}
		}
	}

	async invalidateAllCache(keys: string[]): Promise<void> {
		this.apiDebugger.log(`Invalidating all cache for keyPrefixs: ${keys}`);
		await this.cacheManager.mdel(keys);
	}
}
