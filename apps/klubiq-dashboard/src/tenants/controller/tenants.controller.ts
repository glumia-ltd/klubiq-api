import { Controller, Get, Param, Query } from '@nestjs/common';
import { TenantsService } from '../services/tenants.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth, AuthType } from '@app/auth';
import { GetTenantDto } from '../dto/requests/get-tenant-dto';

@ApiTags('tenant')
@Controller('tenants')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
export class TenantsController {
	constructor(private readonly tenantsService: TenantsService) {}

	@Get('lease')
	getAllTenantwithLease(@Query() getTenantDto: GetTenantDto) {
		return this.tenantsService.findAll(getTenantDto);
	}

	@Get('lease/:id')
	getTenantPerLease(@Param('id') id: string) {
		return this.tenantsService.findByLeaseId(id);
	}

	@Get(':id')
	getTenantDetails(@Param('id') id: string) {
		return this.tenantsService.findOne(id);
	}

	@Get('organization/:organizationUuid')
	getOrganizationTenants(@Param('organizationUuid') organizationUuid: string) {
		return this.tenantsService.findByOrganizationId(organizationUuid);
	}
}
