import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
	constructor(
		private readonly cacheBaseKey: string,
		private readonly cacheTTL: number,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	// gets all data by cache key
	async getCache<T>(): Promise<T[]> {
		return await this.cacheManager.get<T[]>(this.cacheBaseKey);
	}

	// sets all cache data
	async setCache<T>(data: T): Promise<void> {
		await this.cacheManager.set(this.cacheBaseKey, data);
	}

	// gets a cached data by Id or identifier
	async getCacheByIdentifier<T>(key: string, identifier: any): Promise<T> {
		const cachedList = await this.cacheManager.get<T[]>(this.cacheBaseKey);
		return cachedList.find((f) => f[key] == identifier);
	}

	// This updates cache after create
	async updateCacheAfterCreate<T>(newData: T): Promise<boolean> {
		const cachedList = await this.cacheManager.get<T[]>(this.cacheBaseKey);
		if (cachedList) {
			this.cacheManager.set(
				this.cacheBaseKey,
				[...cachedList, newData],
				this.cacheTTL,
			);
			return true;
		}
	}

	// This updates cache after data update
	async updateCacheAfterUpsert<T>(
		key: string,
		identifier: any,
		updateDto: any,
	): Promise<T> {
		const cachedList = await this.cacheManager.get<T[]>(this.cacheBaseKey);
		let updatedCache: T;
		if (cachedList) {
			const data = cachedList.map((cache) => {
				if (cache[key] == identifier) {
					updatedCache = { ...cache, ...updateDto } as T;
					return updatedCache;
				}
				return cache;
			});
			this.cacheManager.set(this.cacheBaseKey, data, this.cacheTTL);
			return updatedCache;
		}
	}

	// This updates cache after delete
	async updateCacheAfterdelete<T>(key: string, identifier: any): Promise<void> {
		const cachedList = await this.cacheManager.get<T[]>(this.cacheBaseKey);
		if (cachedList) {
			this.cacheManager.set(
				this.cacheBaseKey,
				cachedList.filter((f) => f[key] != identifier),
				this.cacheTTL,
			);
		}
	}
}
