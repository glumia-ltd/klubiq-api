import {
	Controller,
	Get,
	//Body,
	//UseGuards,
	HttpException,
	HttpStatus,
	Inject,
	Param,
	UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
	CACHE_MANAGER,
	CacheInterceptor,
	CacheKey,
	CacheTTL,
} from '@nestjs/cache-manager';
import { PermissionsService } from '../permissions/permissions.service';
import { ViewOrgRoleDto } from '../dto/responses/org-role.dto';
import { Auth, AuthType } from '@app/auth';
import {
	PropertiesCategoryService,
	PropertiesPurposeService,
	PropertiesStatusService,
	PropertiesTypeService,
} from '..';

import { ViewFeatureDto } from '../dto/responses/feature-response.dto';
import { FeaturesService } from '../services/features.service';
import { Cache } from 'cache-manager';
@ApiTags('public')
@ApiSecurity('ApiKey')
@Auth(AuthType.ApiKey)
@Controller('public')
@UseInterceptors(CacheInterceptor)
@CacheTTL(60 * 60 * 24)
export class PublicController {
	constructor(
		private readonly permissionService: PermissionsService,
		private readonly propertyCategoryService: PropertiesCategoryService,
		private readonly propertyStatusService: PropertiesStatusService,
		private readonly propertyTypeService: PropertiesTypeService,
		private readonly propertyPurposeService: PropertiesPurposeService,
		private readonly featuresService: FeaturesService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	@CacheKey('roles')
	@Get('roles')
	@ApiOkResponse({ description: 'Get all roles' })
	async getRoles(): Promise<ViewOrgRoleDto[]> {
		try {
			const roles = await this.permissionService.getOrgRoles();
			return roles;
		} catch (error) {
			throw new HttpException(
				'Failed to get roles',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	@Get('property-metadata')
	async getPropertyInfo() {
		const categories =
			await this.propertyCategoryService.getAllPropertyCategories();
		const statuses = await this.propertyStatusService.getAllPropertyStatus();
		const types = await this.propertyTypeService.getAllPropertyTypes();
		const purposes = await this.propertyPurposeService.getAllPropertyPurpose();

		return {
			categories,
			statuses,
			types,
			purposes,
		};
	}

	@CacheKey('features')
	@Get('features')
	@ApiOkResponse({ description: 'Get all features' })
	async getAppFeatures(): Promise<ViewFeatureDto[]> {
		try {
			const features = await this.featuresService.getAppFeatures();
			return features;
		} catch (error) {
			throw new HttpException(
				'Failed to get features',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	@Get('features/:id')
	@ApiOkResponse({ description: 'Get feature by id' })
	async getFeature(@Param('id') id: number): Promise<ViewFeatureDto> {
		try {
			const cachedFeature = await this.cacheManager.get<ViewFeatureDto>(
				`feature:${id}`,
			);
			if (!cachedFeature) {
				const feature = await this.featuresService.getFeatureById(id);
				await this.cacheManager.set(`feature:${id}`, feature);
				return feature;
			}
			return cachedFeature;
		} catch (error) {
			throw new HttpException(
				'Failed to get feature by id',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
