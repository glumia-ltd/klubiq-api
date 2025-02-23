import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	ParseUUIDPipe,
	Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/requests/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/requests/update-organization.dto';
import { OrganizationResponseDto } from '../dto/responses/organization-response.dto';
import { PageDto } from '@app/common/dto/pagination/page.dto';
import { PageOptionsDto } from '@app/common/dto/pagination/page-options.dto';
import { AppFeature, Permissions } from '@app/common/config/config.constants';
import { Permission, Auth, Feature } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';

@ApiTags('organizations')
@Controller('organizations')
@Auth(AuthType.Bearer)
@ApiBearerAuth()
@Feature(AppFeature.SETTING)
export class OrganizationController {
	constructor(private readonly organizationService: OrganizationService) {}

	@Post()
	@ApiOkResponse({
		description: 'Creates a new organization',
		type: OrganizationResponseDto,
	})
	async create(@Body() createOrganizationDto: CreateOrganizationDto) {
		return await this.organizationService.create(createOrganizationDto);
	}

	@Get()
	@ApiOkResponse({
		description: 'Gets all organization',
		type: OrganizationResponseDto,
	})
	async findAll(
		@Query() pageOptionsDto: PageOptionsDto,
	): Promise<PageDto<OrganizationResponseDto>> {
		return await this.organizationService.findAll(pageOptionsDto);
	}

	@Get(':uuid')

	//@Permission(Permissions.READ, Permissions.CREATE, Permissions.UPDATE, Permissions.DELETE)
	@ApiOkResponse({
		description: 'Gets a organization by uuid',
		type: OrganizationResponseDto,
	})
	async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
		return await this.organizationService.getOrganizationByUuId(uuid);
	}

	@Patch(':uuid')
	@Permission(Permissions.CREATE)
	@ApiOkResponse({
		description: 'Updates an organization',
		type: OrganizationResponseDto,
	})
	async update(
		@Param('uuid', new ParseUUIDPipe()) uuid: string,
		@Body() updateOrganizationDto: UpdateOrganizationDto,
	) {
		return await this.organizationService.update(uuid, updateOrganizationDto);
	}

	@ApiOkResponse({
		description: 'soft deletes an organization',
	})
	@Post('delete/:uuid')
	async softDelete(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
		return await this.organizationService.softDeleteOrganization(uuid);
	}

	@ApiOkResponse({
		description: 'Removes an organization from the database',
	})
	@Delete(':uuid')
	async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
		return await this.organizationService.removeOrganization(uuid);
	}

	@Put(':uuid')
	@Permission(Permissions.CREATE)
	@ApiOkResponse({
		description: 'Updates an organization',
		type: OrganizationResponseDto,
	})
	async updateNewOrganizationContact(
		@Param('uuid', new ParseUUIDPipe()) uuid: string,
		@Body() updateOrganizationDto: UpdateOrganizationDto,
	) {
		return await this.organizationService.updateNewCompanyContact(
			updateOrganizationDto,
			uuid,
		);
	}
}
