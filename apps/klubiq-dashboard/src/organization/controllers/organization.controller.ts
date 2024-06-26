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
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationResponseDto } from '../dto/organization-response.dto';
import {
	UserRoles,
	PageDto,
	PageOptionsDto,
	AppFeature,
	Actions,
} from '@app/common';
import {
	Ability,
	Auth,
	Feature,
	Roles,
} from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';

@ApiTags('organization')
@Controller('organization')
@Auth(AuthType.Bearer)
@ApiBearerAuth()
@Feature(AppFeature.SETTING)
export class OrganizationController {
	constructor(private readonly organizationService: OrganizationService) {}

	@Post()
	@Roles(UserRoles.SUPER_ADMIN, UserRoles.SUPER_ADMIN)
	@ApiOkResponse({
		description: 'Creates a new organization',
		type: OrganizationResponseDto,
	})
	async create(@Body() createOrganizationDto: CreateOrganizationDto) {
		return await this.organizationService.create(createOrganizationDto);
	}

	@Get()
	@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.STAFF)
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
	@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.STAFF)
	@Ability(Actions.WRITE, Actions.VIEW)
	@ApiOkResponse({
		description: 'Gets a organization by uuid',
		type: OrganizationResponseDto,
	})
	async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
		return await this.organizationService.getOrganizationByUuId(uuid);
	}

	@Patch(':uuid')
	@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.STAFF)
	@Ability(Actions.WRITE)
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

	@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
	@ApiOkResponse({
		description: 'soft deletes an organization',
	})
	@Post('delete/:uuid')
	async softDelete(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
		return await this.organizationService.softDeleteOrganization(uuid);
	}

	@Roles(UserRoles.SUPER_ADMIN)
	@ApiOkResponse({
		description: 'Removes an organization from the database',
	})
	@Delete(':uuid')
	async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
		return await this.organizationService.removeOrganization(uuid);
	}

	@Put(':uuid')
	@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
	@Ability(Actions.WRITE)
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
