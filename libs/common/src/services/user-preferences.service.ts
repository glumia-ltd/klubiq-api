import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { CacheKeys } from '../config/config.constants';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectMapper } from '@automapper/nestjs';
import { UserPreferences } from '../database/entities/user-preferences.entity';
import { Mapper } from '@automapper/core';
import { ClsService } from 'nestjs-cls';
import { SharedClsStore } from '../dto/public/shared-clsstore';
import { ErrorMessages } from '../config/error.constant';
import { UserPreferenceRepository } from '../repositories/user-preference.repository';

@Injectable()
export class UserPreferencesService {
	private readonly logger = new Logger(UserPreferencesService.name);
	private readonly cacheKey = CacheKeys.USER_PREFERENCES;
	constructor(
		private readonly userPreferencesRepository: UserPreferenceRepository,
		private readonly cls: ClsService<SharedClsStore>,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async getUserPreferences(userId: string): Promise<UserPreferences> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		const cachedUserPreferences = await this.cacheManager.get<UserPreferences>(
			`${this.cacheKey}_${userId}`,
		);
		if (cachedUserPreferences) {
			return cachedUserPreferences;
		}
		const userPreferences = await this.userPreferencesRepository.findOne({
			where: { profile: { profileUuid: userId } },
		});
		if (userPreferences) {
			await this.cacheManager.set(
				`${this.cacheKey}_${userId}`,
				userPreferences,
			);
		}
		return userPreferences;
	}

	async updateUserPreferences(
		userId: string,
		preferences: Record<string, any>,
	): Promise<UserPreferences> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		let userPreferences = await this.getUserPreferences(userId);
		if (!userPreferences) {
			userPreferences = this.userPreferencesRepository.create({
				profile: { profileUuid: userId },
				preferences,
			});
		} else {
			userPreferences.preferences = {
				...userPreferences.preferences,
				...preferences,
			};
		}
		const updatedResult =
			await this.userPreferencesRepository.save(userPreferences);
		await this.cacheManager.set(`${this.cacheKey}_${userId}`, updatedResult);
		return updatedResult;
	}
}
