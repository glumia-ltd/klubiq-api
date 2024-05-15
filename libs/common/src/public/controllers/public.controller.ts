import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiOkResponse,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import {
	OrgRoleResponseDto,
	ViewSystemRoleDto,
} from '../../dto/responses/org-role.dto';
import { Auth, AuthType } from '@app/auth';
import {
	PropertiesCategoryService,
	PropertiesPurposeService,
	PropertiesStatusService,
	PropertiesTypeService,
	ViewFeaturePermissionDto,
} from '../..';

import { ViewFeatureDto } from '../../dto/responses/feature-response.dto';
import { FeaturesService } from '../../services/features.service';
import {
	CreateFeatureDto,
	UpdateFeatureDto,
} from '../../dto/requests/feature-requests.dto';
import { FeaturePermissionService } from '../../permissions/feature-permission.service';
import {
	CreateFeaturePermissionDto,
	UpdateFeaturePermissionDto,
} from '@app/common/dto/requests/permission-requests.dto';
import { RolesService } from '../../permissions/roles.service';
import {
	CreateRoleDto,
	UpdateRoleDto,
	UpdateRoleFeaturePermissionDto,
} from '../../dto/requests/role.dto';
import { PropertiesAmenityService } from '@app/common/services/properties-amenity.service';

@ApiTags('public')
@ApiSecurity('ApiKey')
@Auth(AuthType.ApiKey)
@Controller('public')
export class PublicController {
	constructor(
		private readonly propertyCategoryService: PropertiesCategoryService,
		private readonly propertyStatusService: PropertiesStatusService,
		private readonly propertyTypeService: PropertiesTypeService,
		private readonly propertyPurposeService: PropertiesPurposeService,
		private readonly featuresService: FeaturesService,
		private readonly featurePermissionService: FeaturePermissionService,
		private readonly roleService: RolesService,
		private readonly propertyAmenityService: PropertiesAmenityService,
	) {}

	@Get('property-metadata')
	async getPropertyFormViewData() {
		const categories =
			await this.propertyCategoryService.getAllPropertyCategories();
		const statuses = await this.propertyStatusService.getAllPropertyStatus();
		const types = await this.propertyTypeService.getAllPropertyTypes();
		const purposes = await this.propertyPurposeService.getAllPropertyPurpose();
		const amenities =
			await this.propertyAmenityService.getAllPropertyAmenities();

		return {
			categories,
			statuses,
			types,
			purposes,
			amenities,
		};
	}

	//#region FEATURES
	@Get('features')
	@ApiOkResponse({ description: 'Get all features' })
	async getAppFeatures(): Promise<ViewFeatureDto[]> {
		try {
			const features = await this.featuresService.getAppFeatures();
			return features;
		} catch (error) {
			throw error;
		}
	}

	@Get('features/:id')
	@ApiOkResponse({ description: 'Get feature by id' })
	async getFeature(@Param('id') id: number): Promise<ViewFeatureDto> {
		try {
			const featureData = await this.featuresService.getFeatureById(id);
			return featureData;
		} catch (error) {
			throw error;
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
			throw error;
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
			throw error;
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
			throw error;
		}
	}
	//#endregion

	//#region  REGION ----- FEATURE-PERMISSION
	@Get('features-permissions')
	@ApiOkResponse({ description: 'Get all features permissions' })
	async getFeaturesPermissions(): Promise<ViewFeaturePermissionDto[]> {
		try {
			const resp = await this.featurePermissionService.getFeaturePermissions();
			return resp;
		} catch (error) {
			throw error;
		}
	}

	@Get('features-permissions/:id')
	@ApiOkResponse({ description: 'Get a feature-permission' })
	async getFeaturesPermission(
		@Param('id') id: number,
	): Promise<ViewFeaturePermissionDto> {
		try {
			const resp =
				await this.featurePermissionService.getFeaturePermissionsById(id);
			return resp;
		} catch (error) {
			throw error;
		}
	}

	@Post('features-permissions')
	@ApiCreatedResponse({
		description: 'Creates a new feature-permission for the app',
	})
	async createFeaturePermission(
		@Body() createFeaturePermissionDto: CreateFeaturePermissionDto,
	): Promise<ViewFeaturePermissionDto> {
		try {
			const response =
				await this.featurePermissionService.createFeaturePermission(
					createFeaturePermissionDto,
				);
			return response;
		} catch (error) {
			throw error;
		}
	}

	@Patch('features-permissions/:id')
	@ApiOkResponse({
		description: 'Updates a feature permission',
		type: ViewFeaturePermissionDto,
	})
	async updateFeaturePermission(
		@Param('id') id: number,
		@Body() updateDto: UpdateFeaturePermissionDto,
	): Promise<ViewFeaturePermissionDto> {
		try {
			const response =
				await this.featurePermissionService.updateFeaturePermission(
					id,
					updateDto,
				);
			return response;
		} catch (error) {
			throw error;
		}
	}

	@Delete('features-permissions/:id')
	@ApiOkResponse({
		description: 'Deletes a feature permission',
	})
	async deleteFeaturePermission(@Param('id') id: number) {
		try {
			const isDeleted =
				await this.featurePermissionService.deleteFeaturePermission(id);
			return isDeleted;
		} catch (error) {
			throw error;
		}
	}
	//#endregion

	//#region  REGION ----- SYSTEM-ROLE
	@Get('system-roles')
	@ApiOkResponse({ description: 'Get all system roles' })
	async getSystemRoles(): Promise<ViewSystemRoleDto[]> {
		try {
			const resp = await this.roleService.getSystemRoles();
			return resp;
		} catch (error) {
			throw error;
		}
	}
	@Get('system-roles/:id')
	@ApiOkResponse({ description: 'Get a system role' })
	async getSystemRole(@Param('id') id: number): Promise<ViewSystemRoleDto> {
		try {
			const resp = await this.roleService.getSystemRoleById(id);
			return resp;
		} catch (error) {
			throw error;
		}
	}
	@Post('system-roles')
	@ApiCreatedResponse({
		description: 'Creates a new system role for the app',
	})
	async createSystemRole(
		@Body() createSystemRoleDto: CreateRoleDto,
	): Promise<ViewSystemRoleDto> {
		try {
			const response =
				await this.roleService.createSystemRole(createSystemRoleDto);
			return response;
		} catch (error) {
			throw error;
		}
	}

	@Patch('system-roles/:id')
	@ApiOkResponse({
		description: 'Updates a system role',
		type: ViewSystemRoleDto,
	})
	async updateSystemRole(
		@Param('id') id: number,
		@Body() updateDto: UpdateRoleDto,
	): Promise<ViewSystemRoleDto> {
		try {
			const response = await this.roleService.updateSystemRole(id, updateDto);
			return response;
		} catch (error) {
			throw error;
		}
	}
	@Delete('system-roles/:id')
	@ApiOkResponse({
		description: 'Deletes a system role',
	})
	async deleteSystemRole(@Param('id') id: number) {
		try {
			const isDeleted = await this.roleService.deleteSystemRole(id);
			return isDeleted;
		} catch (error) {
			throw error;
		}
	}
	//#endregion

	//#region   REGION ----- ORGANIZATION-ROLE
	@Get('organization-roles')
	@ApiOkResponse({ description: 'Get all organization roles' })
	async getOrgRoles(): Promise<OrgRoleResponseDto[]> {
		try {
			const resp = await this.roleService.getOrgRoles();
			return resp;
		} catch (error) {
			throw error;
		}
	}

	@Get('organization-roles/:id')
	@ApiOkResponse({ description: 'Get an organization role' })
	async getOrgRole(@Param('id') id: number): Promise<OrgRoleResponseDto> {
		try {
			const resp = await this.roleService.getOrgRoleById(id);
			return resp;
		} catch (error) {
			throw error;
		}
	}

	@Post('organization-roles')
	@ApiCreatedResponse({
		description: 'Creates a new organization role for the app',
	})
	async createOrgRole(
		@Body() createOrgRoleDto: CreateRoleDto,
	): Promise<OrgRoleResponseDto> {
		try {
			return await this.roleService.createOrgRole(createOrgRoleDto);
		} catch (error) {
			throw error;
		}
	}

	@Put('organization-roles/:id')
	@ApiOkResponse({
		description: 'Updates an organization role',
		type: OrgRoleResponseDto,
	})
	async updateOrgRole(
		@Param('id') id: number,
		@Body() updateDto: UpdateRoleFeaturePermissionDto,
	): Promise<OrgRoleResponseDto> {
		try {
			const response = await this.roleService.updateOrgRole(id, updateDto);
			return response;
		} catch (error) {
			throw error;
		}
	}

	@Delete('organization-roles/:id')
	@ApiOkResponse({
		description: 'Deletes an organization role',
	})
	async deleteOrgRole(@Param('id') id: number) {
		try {
			await this.roleService.deleteOrgRole(id);
		} catch (error) {
			throw error;
		}
	}
	//#endregion
}
