import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
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
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';
import { Permission, Auth, Feature } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';
import { Permissions, AppFeature } from '@app/common/config/config.constants';
import { CreateLeaseDto } from '../dto/requests/create-lease.dto';
import { LeaseDetailsDto, LeaseDto } from '../dto/responses/view-lease.dto';
import { UpdateLeaseDto } from '../dto/requests/update-lease.dto';
import { PageDto } from '@app/common/dto/pagination/page.dto';
import { GetLeaseDto } from '../dto/requests/get-lease.dto';
import { CreateTenantDto } from '@app/common/dto/requests/create-tenant.dto';
import { FileUploadDto } from '@app/common/dto/requests/file-upload.dto';
import { String } from 'lodash';

@ApiTags('leases')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Feature(AppFeature.LEASE)
@Controller('leases')
export class LeaseController {
	constructor(private readonly leaseService: LeaseService) {}

	@Get('unit/:unitId')
	@Permission(
		Permissions.READ,
		Permissions.CREATE,
		Permissions.UPDATE,
		Permissions.DELETE,
	)
	@ApiOkResponse({
		description: 'Gets a property unit leases',
		type: () => LeaseDto,
		isArray: true,
		schema: {
			type: 'array',
			items: { $ref: '#/components/schemas/LeaseDto' },
		},
	})
	@ApiParam({ description: 'Unit Id', name: 'unitId', type: String })
	async getPropertyLeases(@Param('unitId') unitId: string) {
		try {
			const result = await this.leaseService.getAllUnitLeases(unitId);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Post()
	@Permission(Permissions.CREATE)
	@ApiCreatedResponse({
		description: 'Creates a new lease',
		type: () => LeaseDto,
	})
	async createLease(@Body() leaseDto: CreateLeaseDto) {
		try {
			await this.leaseService.createLease(leaseDto);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Patch(':id')
	@Permission(Permissions.CREATE)
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Updates a lease',
		type: () => LeaseDto,
	})
	async updateLease(@Param('id') id: string, @Body() leaseDto: UpdateLeaseDto) {
		try {
			const result = await this.leaseService.updateLeaseById(id, leaseDto);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get(':id')
	@Permission(
		Permissions.READ,
		Permissions.CREATE,
		Permissions.UPDATE,
		Permissions.DELETE,
	)
	@ApiOkResponse({
		description: 'Gets a lease by Id',
		type: () => LeaseDetailsDto,
	})
	@ApiParam({ description: 'Lease Id', name: 'id', type: Number })
	async getLeaseById(@Param('id') id: string) {
		try {
			const result = await this.leaseService.getLeaseById(id);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get()
	@Permission(
		Permissions.READ,
		Permissions.CREATE,
		Permissions.UPDATE,
		Permissions.DELETE,
	)
	@ApiOkResponse({
		description: 'Gets an organization leases',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: { $ref: '#/components/schemas/LeaseDto' },
				},
				pagination: { $ref: '#/components/schemas/PageDto' },
			},
		},
		type: () => PageDto<LeaseDto[]>,
	})
	async getLeases(@Query() getLeaseDto: GetLeaseDto) {
		try {
			const result = await this.leaseService.getOrganizationLeases(getLeaseDto);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Post(':id/addTenants')
	@Permission(Permissions.CREATE)
	@ApiCreatedResponse({
		description: 'add tenants to lease',
		type: () => LeaseDto,
	})
	@ApiBody({
		description: 'add tenants to lease',
		schema: {
			type: 'array',
			items: { $ref: '#/components/schemas/CreateTenantDto' },
		},
		type: () => [CreateTenantDto],
	})
	async addTenants(
		@Param('id') id: string,
		@Body() tenantDtos: CreateTenantDto[],
	) {
		try {
			const result = await this.leaseService.addTenantToLease(tenantDtos, id);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Post('upload-url')
	@Permission(Permissions.CREATE)
	async getPresignedUrlForDocument(@Body() fileData: FileUploadDto) {
		try {
			const result =
				await this.leaseService.getPreSignedUploadUrlForDocuments(fileData);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Patch('terminate/:id')
	@Permission(Permissions.CREATE)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOkResponse({
		description: 'Terminates a lease',
	})
	async terminateLease(@Param('id') id: string) {
		try {
			const result = await this.leaseService.terminateLease(id);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Patch('renew/:id')
	@Permission(Permissions.CREATE)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOkResponse({
		description: 'Renews a lease',
	})
	async renewLease(@Param('id') id: string) {
		try {
			const result = await this.leaseService.renewLease(id);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
