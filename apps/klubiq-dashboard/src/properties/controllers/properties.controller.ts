import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	Put,
	Delete,
	BadRequestException,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from '../services/properties.service';
import { UserRoles } from '@app/common';
import { CreatePropertyDto } from '../dto/requests/create-property.dto';
import { PropertyDto } from '../dto/responses/property-response.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import { Auth, Roles } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';
import { GetPropertyDto } from '../dto/requests/get-property.dto';

@ApiTags('properties')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Roles(UserRoles.LANDLORD)
@Controller('properties')
export class PropertiesController {
	constructor(private readonly propertyService: PropertiesService) {}

	@Roles(UserRoles.ORG_OWNER)
	@Post()
	@ApiOkResponse({
		description: 'Creates a new property',
		type: PropertyDto,
	})
	async createProperty(@Body() propertyData: CreatePropertyDto) {
		try {
			const data = await this.propertyService.createProperty(propertyData);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(UserRoles.ORG_OWNER)
	@Post('draft')
	@ApiOkResponse({
		description: 'Creates a draft property',
		type: PropertyDto,
	})
	async createDraftProperty(@Body() propertyData: CreatePropertyDto) {
		try {
			const data = await this.propertyService.createDraftProperty(propertyData);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(UserRoles.ORG_OWNER, UserRoles.PROPERTY_OWNER)
	@HttpCode(HttpStatus.OK)
	@Post(':propertyUuid/draft')
	@ApiOkResponse({
		description: 'Saves a draft property',
	})
	async saveDraftProperty(@Param('propertyUuid') propertyUuid: string) {
		try {
			await this.propertyService.saveDraftProperty(propertyUuid);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(
		UserRoles.ORG_OWNER,
		UserRoles.PROPERTY_OWNER,
		UserRoles.PROPERTY_MANAGER,
	)
	@Get()
	@ApiOkResponse({
		description: 'Returns all properties under an organization',
	})
	async getOrganizationProperties(@Query() getPropertyDto: GetPropertyDto) {
		try {
			const data =
				await this.propertyService.getOrganizationProperties(getPropertyDto);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(
		UserRoles.ORG_OWNER,
		UserRoles.PROPERTY_OWNER,
		UserRoles.PROPERTY_MANAGER,
	)
	@Get(':propertyUuid')
	@ApiOkResponse({
		description: "Returns a property by it's property uuid",
		type: PropertyDto,
	})
	async getPropertyById(
		@Param('propertyUuid') propertyUuid: string,
	): Promise<PropertyDto> {
		try {
			const data = await this.propertyService.getPropertyById(propertyUuid);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(
		UserRoles.ORG_OWNER,
		UserRoles.PROPERTY_OWNER,
		UserRoles.PROPERTY_MANAGER,
	)
	@HttpCode(HttpStatus.OK)
	@Put(':propertyUuid')
	@ApiOkResponse({
		description: "Updates a property found by it's property id",
		type: PropertyDto,
	})
	async updateProperty(
		@Param('propertyUuid') propertyUuid: string,
		@Body() updateData: UpdatePropertyDto,
	) {
		try {
			const data = await this.propertyService.updateProperty(
				propertyUuid,
				updateData,
			);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(UserRoles.ORG_OWNER, UserRoles.PROPERTY_OWNER)
	@HttpCode(HttpStatus.OK)
	@Delete(':propertyUuid')
	@ApiOkResponse({
		description: "Deletes a property found by it's propertyUuid",
	})
	async deleteProperty(
		@Param('propertyUuid') propertyUuid: string,
	): Promise<void> {
		try {
			await this.propertyService.deleteProperty(propertyUuid);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(UserRoles.ORG_OWNER, UserRoles.PROPERTY_OWNER)
	@HttpCode(HttpStatus.OK)
	@Put(':propertyUuid/archive')
	@ApiOkResponse({
		description: "Archive a property found by it's propertyUuid",
	})
	async archiveProperty(@Param('propertyUuid') propertyUuid: string) {
		try {
			await this.propertyService.archiveProperty(propertyUuid);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(UserRoles.ORG_OWNER, UserRoles.PROPERTY_OWNER)
	@HttpCode(HttpStatus.OK)
	@Post(':propertyUuid/units')
	@ApiOkResponse({
		description: 'Adds units to a property',
	})
	async addUnitsToProperty(
		@Param('propertyUuid') propertyUuid: string,
		@Body() unitsDto: CreatePropertyDto[],
	) {
		try {
			const data = await this.propertyService.addUnitsToProperty(
				propertyUuid,
				unitsDto,
			);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
