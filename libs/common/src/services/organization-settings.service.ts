import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { CacheKeys } from '../config/config.constants';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ClsService } from 'nestjs-cls';
import { SharedClsStore } from '../dto/public/shared-clsstore';
import { ErrorMessages } from '../config/error.constant';
import { OrganizationSettings } from '../database/entities/organization-settings.entity';
import { OrganizationSettingsRepository } from '../repositories/organization-settings.repository';

@Injectable()
export class OrganizationSettingsService {
	private readonly logger = new Logger(OrganizationSettingsService.name);
	private readonly cacheKey = CacheKeys.ORGANIZATION_SETTINGS;
	constructor(
		private readonly organizationSettingsRepository: OrganizationSettingsRepository,
		private readonly cls: ClsService<SharedClsStore>,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async getOrganizationSettings(orgId: string): Promise<OrganizationSettings> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		if (currentUser.organizationId !== orgId)
			throw new ForbiddenException(ErrorMessages.NOT_FOUND);
		const cachedOrganizationSettings =
			await this.cacheManager.get<OrganizationSettings>(
				`${this.cacheKey}_${orgId}`,
			);
		if (cachedOrganizationSettings) {
			return cachedOrganizationSettings;
		}
		const organizationSettings =
			await this.organizationSettingsRepository.findOne({
				where: { organization: { organizationUuid: orgId } },
			});
		if (organizationSettings) {
			await this.cacheManager.set(
				`${this.cacheKey}_${orgId}`,
				organizationSettings,
			);
		}
		return organizationSettings;
	}

	async updateOrganizationSettings(
		orgId: string,
		settings: Record<string, any>,
	): Promise<OrganizationSettings> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		if (currentUser.organizationId !== orgId)
			throw new ForbiddenException(ErrorMessages.NOT_FOUND);
		let organizationSettings = await this.getOrganizationSettings(orgId);
		if (!organizationSettings) {
			organizationSettings = this.organizationSettingsRepository.create({
				organization: { organizationUuid: orgId },
				settings,
			});
		} else {
			organizationSettings.settings = {
				...organizationSettings.settings,
				...settings,
			};
		}
		const result =
			await this.organizationSettingsRepository.save(organizationSettings);
		await this.cacheManager.set(`${this.cacheKey}_${orgId}`, result);
		return result;
	}
}
