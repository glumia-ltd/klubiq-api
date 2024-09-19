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
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { PropertiesService } from '../services/properties.service';
import { Actions, AppFeature, PageDto, UserRoles } from '@app/common';
import { CreatePropertyDto } from '../dto/requests/create-property.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import {
	Auth,
	Feature,
	Roles,
	Ability,
} from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';
import { GetPropertyDto } from '../dto/requests/get-property.dto';
import { PropertyManagerDto } from '../dto/requests/property-manager.dto';
import { PropertyDetailsDto } from '../dto/responses/property-details.dto';
import { CreateUnitDto } from '../dto/requests/create-unit.dto';
import { PropertyListDto } from '../dto/responses/property-list-response.dto';
import { SubscriptionLimitGuard } from '@app/common/guards/subscription-limit.guard';

@ApiTags('properties')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Roles(UserRoles.LANDLORD)
@Controller('properties')
@Feature(AppFeature.PROPERTY)
export class PropertiesController {
	constructor(private readonly propertyService: PropertiesService) {}

	@Ability(Actions.WRITE)
	@UseGuards(SubscriptionLimitGuard)
	@Post()
	@ApiCreatedResponse({
		description: 'Creates a new property',
		type: PropertyDetailsDto,
	})
	async createProperty(@Body() propertyData: CreatePropertyDto) {
		try {
			const data = await this.propertyService.createProperty(propertyData);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Ability(Actions.WRITE)
	@UseGuards(SubscriptionLimitGuard)
	@Post('draft')
	@ApiOkResponse({
		description: 'Creates a draft property',
		type: PropertyDetailsDto,
	})
	async createDraftProperty(@Body() propertyData: CreatePropertyDto) {
		try {
			const data = await this.propertyService.createDraftProperty(propertyData);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Ability(Actions.WRITE)
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

	@Ability(Actions.WRITE, Actions.VIEW)
	@Get()
	@ApiOkResponse({
		description:
			'Returns paginated list of properties in an organization based on query params',
		type: PageDto<PropertyListDto>,
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

	@Ability(Actions.WRITE, Actions.VIEW)
	@Get(':propertyUuid')
	@ApiOkResponse({
		description: "Returns a property by it's property uuid",
		type: PropertyDetailsDto,
	})
	async getPropertyById(
		@Param('propertyUuid') propertyUuid: string,
	): Promise<PropertyDetailsDto> {
		try {
			const data = await this.propertyService.getPropertyById(propertyUuid);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Ability(Actions.WRITE)
	@HttpCode(HttpStatus.OK)
	@Put(':propertyUuid')
	@ApiOkResponse({
		description: "Updates a property found by it's property id",
		type: PropertyDetailsDto,
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

	@Ability(Actions.WRITE)
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

	@Ability(Actions.WRITE)
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

	@Ability(Actions.WRITE)
	@HttpCode(HttpStatus.OK)
	@Post(':propertyUuid/units')
	@ApiOkResponse({
		description: 'Adds units to a property',
	})
	async addUnitsToProperty(
		@Param('propertyUuid') propertyUuid: string,
		@Body() unitsDto: CreateUnitDto[],
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

	@Ability(Actions.WRITE)
	@HttpCode(HttpStatus.OK)
	@Post(':propertyUuid/assignToManagerOrOwner')
	@ApiOkResponse({
		description: 'Assign a property to a manager or owner',
	})
	async assignToManager(
		@Param('propertyUuid') propertyUuid: string,
		@Body() managerDto: PropertyManagerDto,
	) {
		try {
			const data = await this.propertyService.assignPropertyToManagerOrOwner(
				propertyUuid,
				managerDto,
			);
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
