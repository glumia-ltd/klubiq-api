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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from '../services/properties.service';
import { PageOptionsDto, UserRoles } from '@app/common';
import { CreatePropertyDto } from '../dto/requests/create-property.dto';
import { PropertyDto } from '../dto/responses/property-response.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import { Auth, Roles } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';

@ApiTags('properties')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Roles(UserRoles.LANDLORD)
@Controller('properties')
export class PropertiesController {
	constructor(private readonly propertyService: PropertiesService) {}

	@Roles(UserRoles.ORG_OWNER, UserRoles.PROPERTY_OWNER)
	@Post()
	@ApiOkResponse({
		description: 'Creates a new property',
		type: PropertyDto,
	})
	createProperty(@Body() propertyData: CreatePropertyDto) {
		try {
			return this.propertyService.createProperty(propertyData);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(UserRoles.ORG_OWNER, UserRoles.PROPERTY_OWNER)
	@Post('draft')
	@ApiOkResponse({
		description: 'Creates a draft property',
		type: PropertyDto,
	})
	createDraftProperty(@Body() propertyData: CreatePropertyDto) {
		try {
			return this.propertyService.createDraftProperty(propertyData);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Roles(UserRoles.ORG_OWNER, UserRoles.PROPERTY_OWNER)
	@Post(':propertyUuid/draft')
	@ApiOkResponse({
		description: 'Saves a draft property',
	})
	saveDraftProperty(@Param('propertyUuid') propertyUuid: string) {
		try {
			this.propertyService.saveDraftProperty(propertyUuid);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get()
	@ApiOkResponse({
		description: 'Returns all properties under an organization',
	})
	getOrganizationProperties(@Query() pageOptionsDto: PageOptionsDto) {
		try {
			return this.propertyService.getOrganizationProperties(pageOptionsDto);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get(':propertyUuid')
	@ApiOkResponse({
		description: "Returns a property by it's property uuid",
		type: PropertyDto,
	})
	getPropertyById(
		@Param('propertyUuid') propertyUuid: string,
	): Promise<PropertyDto> {
		return this.propertyService.getPropertyById(propertyUuid);
	}

	@Put(':propertyId')
	@ApiOkResponse({
		description: "Updates a property found by it's property id",
		type: PropertyDto,
	})
	updateProperty(
		@Param('propertyId') propertyId: number,
		@Body() updateData: UpdatePropertyDto,
	) {
		return this.propertyService.updateProperty(propertyId, updateData);
	}

	@Delete(':propertyUuid')
	@ApiOkResponse({
		description: "Deletes a property found by it's propertyUuid",
	})
	deleteProperty(@Param('propertyUuid') propertyUuid: string): Promise<void> {
		return this.propertyService.deleteProperty(propertyUuid);
	}

	@Put(':propertyUuid/archive')
	@ApiOkResponse({
		description: "Archive a property found by it's propertyUuid",
	})
	archiveProperty(@Param('propertyUuid') propertyUuid: string) {
		try {
			this.propertyService.archiveProperty(propertyUuid);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}

// create property
// get all properties by organization with pagination
// get all properties by propertyManager with pagination
// get all properties by filter with pagination
// get property by id
// update property
// delete property
// archive property
// create property for organization
