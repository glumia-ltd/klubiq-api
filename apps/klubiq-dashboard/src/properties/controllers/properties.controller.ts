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
	ApiBody,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { PropertiesService } from '../services/properties.service';
import {
	Actions,
	AppFeature,
	UserRoles,
} from '@app/common/config/config.constants';
import { CreatePropertyDto } from '../dto/requests/create-property.dto';
import {
	DeletePropertyDto,
	UpdatePropertyDto,
} from '../dto/requests/update-property.dto';
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
import { FileUploadDto } from '@app/common/dto/requests/file-upload.dto';
import { FileUploadService } from '@app/common/services/file-upload.service';
import { PageDto } from '@app/common/dto/pagination/page.dto';

@ApiTags('properties')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Roles(UserRoles.LANDLORD)
@Controller('properties')
@Feature(AppFeature.PROPERTY)
export class PropertiesController {
	constructor(
		private readonly propertyService: PropertiesService,
		private readonly fileUploadService: FileUploadService,
	) {}

	@Ability(Actions.WRITE)
	@UseGuards(SubscriptionLimitGuard)
	@Post()
	@ApiCreatedResponse({
		description: 'Returns details of the created property',
		type: PropertyDetailsDto,
	})
	@ApiBody({
		description: 'Property details to create',
		type: CreatePropertyDto,
	})
	async createProperty(@Body() propertyData: CreatePropertyDto) {
		try {
			const data = await this.propertyService.createProperty(propertyData);
			return data;
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
		description: "Returns the updated property if it's updated successfully",
		type: PropertyDetailsDto,
	})
	@ApiBody({
		description: 'Property data to update',
		type: UpdatePropertyDto,
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
		description: 'Returns as success if property is deleted',
	})
	async deleteProperty(
		@Param('propertyUuid') propertyUuid: string,
		@Body() deleteData: DeletePropertyDto,
	): Promise<void> {
		try {
			if (propertyUuid !== deleteData.uuid) {
				throw new BadRequestException('Property id does not match');
			}
			await this.propertyService.deleteProperty(deleteData);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Ability(Actions.WRITE)
	@HttpCode(HttpStatus.OK)
	@Delete(':propertyUuid/units')
	@ApiOkResponse({
		description: 'Returns as success if units are deleted',
	})
	@ApiBody({
		description: 'Id of units to delete from property',
		schema: {
			type: 'array',
			items: {
				type: 'number',
			},
		},
	})
	async deletePropertyUnits(
		@Param('propertyUuid') propertyUuid: string,
		@Body() unitsIds: number[],
	): Promise<void> {
		try {
			await this.propertyService.deleteUnitsFromProperty(
				unitsIds,
				propertyUuid,
			);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Ability(Actions.WRITE)
	@HttpCode(HttpStatus.OK)
	@Put(':propertyUuid/archive')
	@ApiOkResponse({
		description: 'Returns as success if property is archived',
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
		description: 'Returns the added units in a property',
	})
	@ApiBody({
		description: 'Units to add to property',
		schema: {
			type: 'array',
			items: { $ref: '#/components/schemas/CreateUnitDto' },
		},
		type: () => [CreateUnitDto],
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
		description: 'Returns true if property was assigned successfully',
	})
	@ApiBody({
		description: 'Manager or Owner to assign to property',
		type: PropertyManagerDto,
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

	@Ability(Actions.WRITE)
	@HttpCode(HttpStatus.OK)
	@Post('signed-url')
	@ApiOkResponse({
		description: 'Returns authenticated signature for image upload',
	})
	@ApiBody({
		description: 'Data need to get authenticated signature for image upload',
		type: FileUploadDto,
	})
	async getPresignedUrlForPropertyImage(@Body() fileData: FileUploadDto) {
		try {
			const result = await this.fileUploadService.getUploadSignature(fileData);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Ability(Actions.WRITE, Actions.VIEW)
	@Get('view/list')
	@ApiOkResponse({
		description: "Returns a view list of an organization's properties",
		type: [PropertyDetailsDto],
	})
	async getOrganizationPropertiesViewList() {
		try {
			const data =
				await this.propertyService.getPropertyGroupedUnitsByOrganization();
			return data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
