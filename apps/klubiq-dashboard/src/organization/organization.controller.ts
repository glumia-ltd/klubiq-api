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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { UserRoles, PageDto, PageOptionsDto } from '@app/common';
import { Auth, Roles } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';

@ApiTags('organization')
@Controller('organization')
@Auth(AuthType.Bearer)
@ApiBearerAuth()
export class OrganizationController {
	constructor(private readonly organizationService: OrganizationService) {}

	@Post()
	@Roles(UserRoles.SUPER_ADMIN)
	@ApiOkResponse({
		description: 'Creates a new organization',
		type: OrganizationResponseDto,
	})
	async create(@Body() createOrganizationDto: CreateOrganizationDto) {
		return await this.organizationService.create(createOrganizationDto);
	}

	@Get()
	@Roles(UserRoles.LANDLORD)
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
	@Roles(UserRoles.LANDLORD)
	@ApiOkResponse({
		description: 'Gets a organization by uuid',
		type: OrganizationResponseDto,
	})
	async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
		return await this.organizationService.getOrganizationByUuId(uuid);
	}

	@Patch(':uuid')
	@Roles(UserRoles.ORG_OWNER)
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

	@Roles(UserRoles.ORG_OWNER, UserRoles.ADMIN)
	@ApiOkResponse({
		description: 'Deletes an organization',
	})
	@Delete(':uuid')
	async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
		return await this.organizationService.deleteOrganization(uuid);
	}
}
