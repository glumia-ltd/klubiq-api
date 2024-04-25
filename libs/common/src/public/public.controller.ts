import {
	Controller,
	Get,
	//Body,
	//UseGuards,
	HttpException,
	HttpStatus,
	UseInterceptors,
	//Param,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { PermissionsService } from '../permissions/permissions.service';
import { ViewOrgRoleDto } from '../dto/org-role.dto';
import { Auth, AuthType } from '@app/auth';
import {
	PropertiesCategoryService,
	PropertiesPurposeService,
	PropertiesStatusService,
	PropertiesTypeService,
} from '..';

@ApiTags('public')
@Auth(AuthType.None)
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
}
