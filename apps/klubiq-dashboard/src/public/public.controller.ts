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
import { PermissionsService, ViewOrgRoleDto } from '@app/common';
import { Auth } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('public')
@Auth(AuthType.None)
@Controller('public')
@UseInterceptors(CacheInterceptor)
export class PublicController {
	constructor(private readonly permissionService: PermissionsService) {}

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
