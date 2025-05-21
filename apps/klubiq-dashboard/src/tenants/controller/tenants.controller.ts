import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Put,
	Query,
} from '@nestjs/common';
import { TenantsService } from '../services/tenants.service';
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiTags,
	ApiBadRequestResponse,
	ApiHeader,
} from '@nestjs/swagger';
import { GetTenantDto } from '../dto/requests/get-tenant-dto';
import { Auth, Permission } from '@app/auth/decorators/auth.decorator';
import { PageDto } from '@app/common';
import { AuthType } from '@app/auth/types/firebase.types';
import { LeaseDto, TenantDto } from '../dto/responses/lease-tenant.dto';
import { Permissions } from '@app/common/config/config.constants';
import { UpdateTenantProfileDto } from '../dto/responses/update-tenant-profile';

@ApiTags('tenant')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Controller('tenants')
//@Feature(AppFeature.TENANT)
@ApiHeader({
	name: 'x-tenant-id',
	description: 'The organization tenant id',
	required: false,
})
export class TenantsController {
	constructor(private readonly tenantsService: TenantsService) {}
	@Permission(Permissions.READ)
	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Returns details of all associated tenants',
		type: [TenantDto],
	})
	@ApiBadRequestResponse({ description: 'Invalid query parameters' })
	async getAllTenantWithLease(@Query() getTenantDto: GetTenantDto) {
		try {
			return await this.tenantsService.getAllTenants(getTenantDto);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	//@Permission(Permissions.READ)
	@Get('lease/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Returns lease details by lease ID',
		type: LeaseDto,
	})
	@ApiBadRequestResponse({ description: 'Invalid lease ID' })
	async getTenantPerLease(@Param('id') id: string) {
		try {
			return await this.tenantsService.getLeaseById(id);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	//@Permission(Permissions.READ)
	@Get('organization')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description:
			'Returns paginated list of tenants in an organization based on query params',
		type: PageDto<TenantDto>,
	})
	async getOrganizationTenants(@Query() getTenantDto: GetTenantDto) {
		try {
			return await this.tenantsService.getOrganizationTenants(getTenantDto);
		} catch (error) {
			console.log({ error });

			throw new BadRequestException(error.message);
		}
	}

	@Get('details')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Returns details of loggedin tenant',
	})
	async tenantInfo() {
		try {
			return await this.tenantsService.getTenantInfo();
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	//@Permission(Permissions.READ)
	@Get(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Returns tenant details by tenant ID',
		type: TenantDto,
	})
	@ApiBadRequestResponse({ description: 'Invalid tenant ID' })
	async getTenantDetails(@Param('id') id: string) {
		try {
			return await this.tenantsService.getSingleTenant(id);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	//@Permission(Permissions.DELETE)
	@Delete(':tenantId/remove')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Removes a tenant from an organization',
	})
	@ApiBadRequestResponse({ description: 'Invalid tenant ID' })
	async removeTenant(@Param('tenantId') tenantId: string) {
		try {
			return this.tenantsService.removeTenantFromOrganization(tenantId);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	//@Permission(Permissions.DELETE)
	@Delete(':tenantId/:leaseId/remove')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Removes a tenant from a lease',
	})
	@ApiBadRequestResponse({ description: 'Invalid tenant ID' })
	async removeTenantFromLease(
		@Param('tenantId') tenantId: string,
		@Param('leaseId') leaseId: string,
	) {
		try {
			return this.tenantsService.removeTenantFromLease(tenantId, leaseId);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Put(':profileId')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Updates tenant profile',
	})
	@ApiBadRequestResponse({
		description: 'Invalid Profile Id',
		type: UpdateTenantProfileDto,
	})
	async updateTenantProfile(
		@Param('profileId') profileId: string,
		@Body() updateDto: UpdateTenantProfileDto,
	) {
		try {
			return this.tenantsService.updateTenantProfile(profileId, updateDto);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
