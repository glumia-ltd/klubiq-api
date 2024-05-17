import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	Put,
	Delete,
	Headers,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from '../services/properties.service';
import { Property } from '../entities/property.entity';
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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	createProperty(
		@Body() propertyData: CreatePropertyDto,
		@Headers('x-org-id') orgId?: string,
	) {
		return this.propertyService.createProperty(propertyData);
	}

	@Get('organization/:organizationUuid')
	@ApiOkResponse({
		description: 'Returns all properties under an organization',
		type: [PropertyDto],
	})
	getAllPropertiesByOrganization(
		@Param('organizationUuid') organizationUuid: string,
		@Query() pageOptionsDto: PageOptionsDto,
	): Promise<Property[]> {
		return this.propertyService.getAllPropertiesByOrganization(
			organizationUuid,
			pageOptionsDto,
		);
	}

	@Get()
	@ApiOkResponse({
		description: 'Returns all properties under an organization',
		type: [PropertyDto],
	})
	getAllPropertiesByFilter(
		@Query('filter') filter: any,
		@Query() pageOptionsDto: PageOptionsDto,
	): Promise<Property[]> {
		return this.propertyService.getAllPropertiesByFilter(
			filter,
			pageOptionsDto,
		);
	}

	@Get(':propertyId')
	@ApiOkResponse({
		description: "Returns a property by it's property id",
		type: PropertyDto,
	})
	getPropertyById(@Param('propertyId') propertyId: number): Promise<Property> {
		return this.propertyService.getPropertyById(propertyId);
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

	@Delete(':propertyId')
	@ApiOkResponse({
		description: "Deletes a property found by it's property id",
	})
	deleteProperty(@Param('propertyId') propertyId: number): Promise<void> {
		return this.propertyService.deleteProperty(propertyId);
	}

	@Put(':id/archive')
	@ApiOkResponse({
		description: "Archive a property found by it's property id",
	})
	archiveProperty(@Param('propertyId') propertyId: number) {
		return this.propertyService.archiveProperty(propertyId);
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
