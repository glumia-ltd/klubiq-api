import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheTTl } from '../config/config.constants';
import { Cache } from 'cache-manager';
@Injectable()
export class CacheService {
	private readonly cacheTTL: number = CacheTTl.ONE_DAY;
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	// gets all data by cache key
	async getCache<T>(cacheKey: string): Promise<T[]> {
		return await this.cacheManager.get<T[]>(cacheKey);
	}

	async getItem<T>(cacheKey: string): Promise<T> {
		return await this.cacheManager.get<T>(cacheKey);
	}

	async removeCacheData(cacheKey: string): Promise<void> {
		await this.cacheManager.del(cacheKey);
	}

	// sets all cache data
	async setCache<T>(
		data: T,
		cacheKey: string,
		ttl: number = this.cacheTTL,
	): Promise<void> {
		await this.cacheManager.set(cacheKey, data, ttl);
	}

	// gets a cached data by Id or identifier
	async getCacheByIdentifier<T>(
		cacheKey: string,
		key: string,
		identifier: any,
	): Promise<T> {
		const cachedList = await this.cacheManager.get<T[]>(cacheKey);
		if (cachedList && cachedList.length > 0) {
			return cachedList.find((f) => f[key] == identifier);
		}
	}

	async getCacheByIdentifiers<T>(
		cacheKey: string,
		keys: string[],
		identifiers: any[],
	): Promise<T> {
		const cachedList = await this.cacheManager.get<T[]>(cacheKey);
		if (cachedList && cachedList.length > 0) {
			return cachedList.find((f) => {
				return keys.every((key, index) => f[key] == identifiers[index]);
			});
		}
	}

	// gets a cached data by Id or identifier
	async getCacheByKey<T>(cacheKey: string): Promise<T> {
		return await this.cacheManager.get<T>(cacheKey);
	}

	// This updates cache after create
	async updateCacheAfterCreate<T>(
		cacheKey: string,
		newData: T,
	): Promise<boolean> {
		const cachedList = await this.cacheManager.get<T[]>(cacheKey);
		if (cachedList) {
			this.cacheManager.set(cacheKey, [...cachedList, newData], this.cacheTTL);
			return true;
		}
	}

	// This updates cache after data update
	async updateCacheAfterUpsert<T>(
		cacheKey: string,
		key: string,
		identifier: any,
		updateDto: any,
	): Promise<T> {
		const cachedList = await this.cacheManager.get<T[]>(cacheKey);
		let updatedCache: T;
		if (cachedList && cachedList.length > 0) {
			const data = cachedList.map((cache) => {
				if (cache[key] == identifier) {
					updatedCache = { ...cache, ...updateDto } as T;
					return updatedCache;
				}
				return cache;
			});
			this.cacheManager.set(cacheKey, data, this.cacheTTL);
			return updatedCache;
		}
	}

	// This updates cache after delete
	async updateCacheAfterdelete<T>(
		cacheKey: string,
		key: string,
		identifier: any,
	): Promise<void> {
		const cachedList = await this.cacheManager.get<T[]>(cacheKey);
		if (cachedList && cachedList.length > 0) {
			this.cacheManager.set(
				cacheKey,
				cachedList.filter((f) => f[key] != identifier),
				this.cacheTTL,
			);
		}
	}

	async updateCacheAfterdeleteWithIdentifiers<T>(
		cacheKey: string,
		key: string[],
		identifier: any[],
	): Promise<void> {
		const cachedList = await this.cacheManager.get<T[]>(cacheKey);
		if (cachedList && cachedList.length > 0) {
			this.cacheManager.set(
				cacheKey,
				cachedList.filter((f) => {
					return key.every((k, index) => f[k] != identifier[index]);
				}),
				this.cacheTTL,
			);
		}
	}

	async invalidateCache(cacheKey: string): Promise<void> {
		await this.cacheManager.del(cacheKey);
	}

	async invalidateCacheByKeys(cacheKeys: string[]): Promise<void> {
		await this.cacheManager.mdel(cacheKeys);
	}
}
