import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiOkResponse,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { PermissionsService } from '../../permissions/permissions.service';
import { ViewOrgRoleDto } from '../../dto/responses/org-role.dto';
import { Auth, AuthType } from '@app/auth';
import {
	PropertiesCategoryService,
	PropertiesPurposeService,
	PropertiesStatusService,
	PropertiesTypeService,
} from '../..';

import { ViewFeatureDto } from '../../dto/responses/feature-response.dto';
import { FeaturesService } from '../../services/features.service';
import {
	CreateFeatureDto,
	UpdateFeatureDto,
} from '../../dto/requests/feature-requests.dto';
@ApiTags('public')
@ApiSecurity('ApiKey')
@Auth(AuthType.ApiKey)
@Controller('public')
export class PublicController {
	constructor(
		private readonly permissionService: PermissionsService,
		private readonly propertyCategoryService: PropertiesCategoryService,
		private readonly propertyStatusService: PropertiesStatusService,
		private readonly propertyTypeService: PropertiesTypeService,
		private readonly propertyPurposeService: PropertiesPurposeService,
		private readonly featuresService: FeaturesService,
	) {}

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
	async getPropertyFormViewData() {
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
			const featureData = await this.featuresService.getFeatureById(id);
			return featureData;
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
