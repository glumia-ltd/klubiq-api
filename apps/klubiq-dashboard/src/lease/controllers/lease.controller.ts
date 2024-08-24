import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { LeaseService } from '../services/lease.service';
import {
	ApiBearerAuth,
	ApiBody,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import {
	Ability,
	Auth,
	Feature,
	Roles,
} from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';
import {
	Actions,
	AppFeature,
	UserRoles,
} from '@app/common/config/config.constants';
import { CreateLeaseDto } from '../dto/requests/create-lease.dto';
import { LeaseDto } from '../dto/responses/view-lease.dto';
import { UpdateLeaseDto } from '../dto/requests/update-lease.dto';
import { PageDto } from '@app/common/dto/pagination/page.dto';
import { GetLeaseDto } from '../dto/requests/get-lease.dto';
import { CreateTenantDto } from '@app/common/dto/requests/create-tenant.dto';
import { FileUploadDto } from '@app/common/dto/requests/file-upload.dto';

@ApiTags('leases')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Feature(AppFeature.LEASE)
@Roles(
	UserRoles.ADMIN,
	UserRoles.SUPER_ADMIN,
	UserRoles.LANDLORD,
	UserRoles.TENANT,
)
@Controller('leases')
export class LeaseController {
	constructor(private readonly leaseService: LeaseService) {}

	@Get('property/:propertyUuid')
	@Ability(Actions.VIEW, Actions.WRITE)
	@ApiOkResponse({
		description: 'Gets a property leases',
		type: () => LeaseDto,
		isArray: true,
	})
	async getPropertyLeases(@Param('propertyUuid') propertyUuid: string) {
		try {
			const result = await this.leaseService.getAllPropertyLeases(propertyUuid);
			return result;
		} catch (error) {
			throw error;
		}
	}

	@Post()
	@Ability(Actions.WRITE)
	@ApiCreatedResponse({
		description: 'Creates a new lease',
		type: () => LeaseDto,
	})
	async createLease(@Body() leaseDto: CreateLeaseDto) {
		try {
			const result = await this.leaseService.createLease(leaseDto);
			return result;
		} catch (error) {
			throw error;
		}
	}

	@Patch(':id')
	@Ability(Actions.WRITE)
	@ApiOkResponse({
		description: 'Updates a lease',
		type: () => LeaseDto,
	})
	async updateLease(@Param('id') id: number, @Body() leaseDto: UpdateLeaseDto) {
		try {
			const result = await this.leaseService.updateLeaseById(id, leaseDto);
			return result;
		} catch (error) {
			throw error;
		}
	}

	@Get(':id')
	@Ability(Actions.VIEW, Actions.WRITE)
	@ApiOkResponse({
		description: 'Gets a lease by Id',
		type: () => LeaseDto,
	})
	async getLeaseById(@Param('id') id: number) {
		try {
			const result = await this.leaseService.getLeaseById(id);
			return result;
		} catch (error) {
			throw error;
		}
	}

	@Get()
	@Ability(Actions.VIEW, Actions.WRITE)
	@ApiOkResponse({
		description: 'Gets an organization leases',
		type: () => PageDto<LeaseDto>,
	})
	async getLeases(@Query() getLeaseDto: GetLeaseDto) {
		try {
			const result = await this.leaseService.getOrganizationLeases(getLeaseDto);
			return result;
		} catch (error) {
			throw error;
		}
	}

	@Post(':id/addTenants')
	@Ability(Actions.WRITE)
	@ApiOkResponse({
		description: 'add tenants to lease',
		type: () => LeaseDto,
	})
	@ApiBody({ type: () => [CreateTenantDto] })
	async addTenants(
		@Param('id') id: number,
		@Body() tenantDtos: CreateTenantDto[],
	) {
		try {
			const result = await this.leaseService.addTenantToLease(tenantDtos, id);
			return result;
		} catch (error) {
			throw error;
		}
	}

	@Post('upload-url')
	@Ability(Actions.WRITE)
	async getPresignedUrlForPropertyImage(@Body() fileData: FileUploadDto) {
		try {
			const result =
				await this.leaseService.getPreSignedUploadUrlForPropertyImage(fileData);
			return result;
		} catch (error) {
			throw error;
		}
	}
}
