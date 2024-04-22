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

@ApiTags('public')
@Auth(AuthType.None)
@Controller('public')
@UseInterceptors(CacheInterceptor)
@CacheTTL(60 * 60 * 24)
export class PublicController {
	constructor(private readonly permissionService: PermissionsService) {}

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
}
