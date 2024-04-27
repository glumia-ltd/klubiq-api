import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Inject,
	Param,
	Patch,
	Post,
	UseInterceptors,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiOkResponse,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import {
	CACHE_MANAGER,
	CacheInterceptor,
	CacheKey,
	CacheTTL,
} from '@nestjs/cache-manager';
import { PermissionsService } from '../permissions/permissions.service';
import { ViewOrgRoleDto } from '../dto/responses/org-role.dto';
import { Auth, AuthType } from '@app/auth';
import { ViewFeatureDto } from '../dto/responses/feature-response.dto';
import { FeaturesService } from '../services/features.service';
import { Cache } from 'cache-manager';
import {
	CreateFeatureDto,
	UpdateFeatureDto,
} from '../dto/requests/feature-requests.dto';
@ApiTags('public')
@ApiSecurity('ApiKey')
@Auth(AuthType.ApiKey)
@Controller('public')
@UseInterceptors(CacheInterceptor)
@CacheTTL(60 * 60 * 24)
export class PublicController {
	constructor(
		private readonly permissionService: PermissionsService,
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

	@Post('features')
	@ApiCreatedResponse({ description: 'Creates a new feature for the app' })
	async createFeature(
		@Body() createFeatureDto: CreateFeatureDto,
	): Promise<ViewFeatureDto> {
		try {
			const feature = await this.featuresService.create(createFeatureDto);
			return feature;
		} catch (error) {
			throw new HttpException(
				'Failed to create new feature',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	@Patch('features/:id')
	@ApiOkResponse({
		description: 'Updates a feature',
		type: ViewFeatureDto,
	})
	async updateFeature(
		@Param('id') id: number,
		@Body() updateFeatureDto: UpdateFeatureDto,
	) {
		try {
			const feature = await this.featuresService.update(id, updateFeatureDto);
			return feature;
		} catch (error) {
			throw new HttpException(
				'Failed to create new feature',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	@Delete('features/:id')
	@ApiOkResponse({
		description: 'Deletes a feature',
	})
	async deleteFeature(@Param('id') id: number) {
		try {
			const isDeleted = await this.featuresService.delete(id);
			return isDeleted;
		} catch (error) {
			throw new HttpException(
				'Failed to create new feature',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
