import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	Put,
	Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { PageOptionsDto } from '@app/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyDto } from './dto/property-response.dto';

@ApiTags('properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertiesController {
	constructor(private readonly propertyService: PropertiesService) {}

	@Post()
	@ApiOkResponse({
		description: 'Creates a new property',
		type: PropertyDto,
	})
	createProperty(@Body() propertyData: CreatePropertyDto) {
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
		@Body() updateData: Partial<Property>,
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
	archiveProperty(@Param('propertyId') propertyId: number): Promise<void> {
		return this.propertyService.archiveProperty(propertyId);
	}

	@Post('organization/:organizationUuid')
	@ApiOkResponse({
		description: 'Adds a property data of an organization to the db',
		type: PropertyDto,
	})
	createPropertyForOrganization(
		@Param('organizationUuid') organizationUuid: string,
		@Body() propertyData: Partial<Property>,
	) {
		return this.propertyService.createPropertyForOrganization(
			organizationUuid,
			propertyData,
		);
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
