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
	ApiBearerAuth,
	ApiBody,
	ApiCreatedResponse,
	ApiExcludeEndpoint,
	ApiOkResponse,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import {
	Permissions,
	AppFeature,
	FILTER_OPTIONS,
	FilterData,
	LEASE_FILTER_OPTIONS,
} from '../../config/config.constants';
import { ViewFeatureDto } from '../../dto/responses/feature-response.dto';
import { FeaturesService } from '../../services/features.service';
import {
	CreateFeatureDto,
	UpdateFeatureDto,
} from '../../dto/requests/feature-requests.dto';
import { FeaturePermissionService } from '../../permissions/feature-permission.service';
import { CreateFeaturePermissionDto } from '@app/common/dto/requests/permission-requests.dto';
import { RolesService } from '../../permissions/roles.service';
import {
	CreateRoleFeaturePermission,
	UpdateRoleFeaturePermissionDto,
} from '../../dto/requests/role.dto';
import { PropertiesAmenityService } from '@app/common/services/properties-amenity.service';
import { PropertiesCategoryService } from '@app/common/services/properties-category.service';
import { PropertiesStatusService } from '@app/common/services/properties-status.service';
import { PropertiesTypeService } from '@app/common/services/properties-type.service';
import { PropertiesPurposeService } from '@app/common/services/properties-purpose.service';
import { ViewPermissionDto } from '@app/common/dto/responses/feature-permission.dto';
import { AuthType } from '@app/auth/types/firebase.types';
import { Permission, Auth, Feature } from '@app/auth/decorators/auth.decorator';
import { PermissionsService } from '@app/common/permissions/permissions.service';
import { PublicService } from '@app/common/services/public.service';
import {
	FilterViewModel,
	//PropertyAndTenantViewModel,
} from '@app/common/dto/responses/shared-view-model.dto';
import { OrganizationRole } from '@app/common/database/entities/organization-role.entity';
import { FeaturePermission } from '@app/common/database/entities/feature-permission.entity';

@ApiTags('public')
@ApiBearerAuth()
@ApiSecurity('ApiKey')
@Controller('public')
@Feature(AppFeature.SETTING)
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
		private readonly permissionService: PermissionsService,
		private readonly publicService: PublicService,
	) {}

	@Auth(AuthType.None)
	@Get('property-metadata')
	@ApiOkResponse({
		description: 'Get metadata for property view and forms',
		//type: Object,
	})
	async getPropertyFormViewData() {
		const categories =
			await this.propertyCategoryService.getAllPropertyCategories();
		const statuses = await this.propertyStatusService.getAllPropertyStatus();
		const types = await this.propertyTypeService.getAllPropertyTypes();
		const purposes = await this.propertyPurposeService.getAllPropertyPurpose();
		const amenities =
			await this.propertyAmenityService.getAllPropertyAmenities();
		const filterOptions: FilterData[] = [
			{
				id: 'purposeId',
				title: 'Purpose',
				options: purposes.map((option) => {
					return {
						label: option.name,
						value: option.id,
						Icon: '',
					};
				}),
			},
			{
				id: 'typeId',
				title: 'Property Type',
				options: types.map((option) => {
					return {
						label: option.name,
						value: option.id,
						Icon: '',
					};
				}),
			},
			...FILTER_OPTIONS,
		];
		return {
			categories,
			statuses,
			types,
			purposes,
			amenities,
			filterOptions,
		};
	}

	@Auth(AuthType.Bearer)
	@Get('org/:orgId/properties')
	@ApiOkResponse({
		description: 'Get view list of properties and tenants for an organization',
		//type: () => PropertyAndTenantViewModel,
	})
	async getOrganizationPropertiesAndTenantsViewList(
		@Param('orgId') orgId: string,
	) {
		if (!orgId) return [];
		const propertyList =
			await this.publicService.getOrganizationPropertiesViewList();
		const tenantList = await this.publicService.getOrganizationTenants(orgId);
		return { properties: propertyList, tenants: tenantList };
	}

	@Auth(AuthType.Bearer)
	@Get('lease-metadata')
	@ApiOkResponse({
		description: 'Get metadata for lease view and forms',
		type: () => [FilterViewModel],
	})
	async getLeaseFormViewData() {
		const propertyList =
			await this.publicService.getOrganizationPropertiesViewList();
		const filterOptions: FilterData[] = [
			{
				id: 'propertyId',
				title: 'Property',
				options: propertyList.map((option) => {
					return {
						label: option.name,
						value: option.uuid,
						Icon: '',
					};
				}),
			},
			...LEASE_FILTER_OPTIONS,
		];
		return {
			filterOptions,
		};
	}

	//#region PERMISSIONS
	@Auth(AuthType.None)
	@Get('permissions')
	@ApiOkResponse({
		description: 'Get all permissions',
		type: [ViewPermissionDto],
	})
	async getPermissions(): Promise<ViewPermissionDto[]> {
		try {
			const permissions = await this.permissionService.getPermissions();
			return permissions;
		} catch (error) {
			throw error;
		}
	}
	//#region FEATURES
	@Get('features')
	@Auth(AuthType.None)
	@ApiOkResponse({ description: 'Get all features', type: [ViewFeatureDto] })
	async getAppFeatures(): Promise<ViewFeatureDto[]> {
		try {
			const features = await this.featuresService.getAppFeatures();
			return features;
		} catch (error) {
			throw error;
		}
	}

	@Get('features/:id')
	@Auth(AuthType.None)
	@ApiOkResponse({ description: 'Get feature by id', type: ViewFeatureDto })
	async getFeature(@Param('id') id: number): Promise<ViewFeatureDto> {
		try {
			const featureData = await this.featuresService.getFeatureById(id);
			return featureData;
		} catch (error) {
			throw error;
		}
	}

	@Post('features')
	@ApiCreatedResponse({
		description: 'Creates a new feature for the app',
		type: ViewFeatureDto,
	})
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

	@ApiExcludeEndpoint()
	@Delete('features/:id')
	@ApiOkResponse({
		description: 'Deletes a feature',
		type: Boolean,
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
	@Auth(AuthType.None)
	@Get('features-permissions')
	@ApiOkResponse({ description: 'Get all features permissions' })
	async getFeaturesPermissions(): Promise<FeaturePermission[]> {
		try {
			const resp = await this.featurePermissionService.getFeaturePermissions();
			return resp;
		} catch (error) {
			throw error;
		}
	}

	@Auth(AuthType.None)
	@Get('features-permissions/:featureId/:permissionId')
	@ApiOkResponse({ description: 'Get a feature-permission' })
	async getFeaturesPermission(
		@Param('featureId') featureId: number,
		@Param('permissionId') permissionId: number,
	): Promise<FeaturePermission> {
		try {
			const resp =
				await this.featurePermissionService.getFeaturePermissionsById(
					featureId,
					permissionId,
				);
			return resp;
		} catch (error) {
			throw error;
		}
	}

	@Permission(Permissions.CREATE)
	@Post('features-permissions')
	@ApiCreatedResponse({
		description: 'Creates a new feature-permission for the app',
	})
	async createFeaturePermission(
		@Body() createFeaturePermissionDto: CreateFeaturePermissionDto,
	): Promise<FeaturePermission> {
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

	@ApiExcludeEndpoint()
	@Delete('features-permissions/:featureId/:permissionId')
	@ApiOkResponse({
		description: 'Deletes a feature permission',
	})
	async deleteFeaturePermission(
		@Param('featureId') featureId: number,
		@Param('permissionId') permissionId: number,
	) {
		try {
			await this.featurePermissionService.deleteFeaturePermission(
				featureId,
				permissionId,
			);
		} catch (error) {
			throw error;
		}
	}
	//#endregion

	//#region   REGION ----- ORGANIZATION-ROLE
	@Auth(AuthType.None)
	@Get('organization-roles')
	@ApiOkResponse({ description: 'Get all organization roles' })
	async getOrgRoles(): Promise<OrganizationRole[]> {
		try {
			const resp = await this.roleService.getAllRoles();
			return resp;
		} catch (error) {
			throw error;
		}
	}

	@Auth(AuthType.None)
	@Get('organization-roles/:id')
	@ApiOkResponse({ description: 'Get an organization role' })
	async getOrgRole(@Param('id') id: number): Promise<OrganizationRole> {
		try {
			const resp = await this.roleService.getRoleById(id);
			return resp;
		} catch (error) {
			throw error;
		}
	}

	@Permission(Permissions.CREATE)
	@Post('organization-roles')
	@ApiBody({
		description: 'Creates a new organization role for the app',
		type: CreateRoleFeaturePermission,
	})
	@ApiCreatedResponse({
		description: 'Creates a new organization role for the app',
	})
	async createOrgRole(
		@Body() createOrgRoleDto: CreateRoleFeaturePermission,
	): Promise<OrganizationRole> {
		try {
			return await this.roleService.createRole(createOrgRoleDto);
		} catch (error) {
			throw error;
		}
	}

	@Permission(Permissions.CREATE)
	@Put('organization-roles/:id')
	@ApiOkResponse({
		description: 'Updates an organization role',
		type: OrganizationRole,
	})
	async updateOrgRole(
		@Param('id') id: number,
		@Body() updateDto: UpdateRoleFeaturePermissionDto,
	): Promise<OrganizationRole> {
		try {
			const response = await this.roleService.updateRole(id, updateDto);
			return response;
		} catch (error) {
			throw error;
		}
	}

	@ApiExcludeEndpoint()
	@Delete('organization-roles/:id')
	@ApiOkResponse({
		description: 'Deletes an organization role',
	})
	async deleteOrgRole(@Param('id') id: number) {
		try {
			await this.roleService.deleteRole(id);
		} catch (error) {
			throw error;
		}
	}
	//#endregion

	//
	@Auth(AuthType.ApiKey)
	@Delete('system/reset-cache')
	@ApiOkResponse({
		description: 'Resets system cache',
	})
	async resetCache() {
		return this.publicService.resetCache();
	}
}
