import {
	Controller,
	Post,
	Get,
	Put,
	Delete,
	Param,
	Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PropertyStatus } from '@app/common';
import {
	CreatePropertyCategoryDto,
	UpdatePropertyCategoryDto,
} from '../dto/property-category.dto';
import { PropertyPeripheralDto } from '../dto/properties-peripheral.dto';
import { PropertiesStatusService } from '../services/properties-status.service';

@ApiBearerAuth()
@ApiTags('properties-status')
@Controller('property-status')
export class PropertyStatusController {
	constructor(
		private readonly propertyStatusService: PropertiesStatusService,
	) {}

	@Post()
	@ApiOkResponse({
		description: 'Creates a new property Status',
		type: PropertyPeripheralDto,
	})
	async createPropertyStatus(
		@Body() createPropertyStatusDto: CreatePropertyCategoryDto,
	): Promise<PropertyStatus> {
		return this.propertyStatusService.createPropertyStatus(
			createPropertyStatusDto,
		);
	}

	@Get(':name')
	@ApiOkResponse({
		description: 'Returns a new property Status that matches the Status name',
		type: PropertyPeripheralDto,
	})
	async getPropertyStatusByName(
		@Param('name') name: string,
	): Promise<PropertyStatus> {
		return this.propertyStatusService.getPropertyStatusByName(name);
	}

	@Get()
	@ApiOkResponse({
		description: 'Returns all  property Statuss',
		type: [PropertyPeripheralDto],
	})
	async getAllPropertyStatuss(): Promise<PropertyPeripheralDto[]> {
		const propertyStatuss =
			await this.propertyStatusService.getAllPropertyStatus();
		return propertyStatuss;
	}

	@Put(':name')
	@ApiOkResponse({
		description: 'Updates a new property Status that matches the Status name',
		type: PropertyPeripheralDto,
	})
	async updatePropertyStatus(
		@Param('name') name: string,
		@Body() updatePropertyStatusDto: UpdatePropertyCategoryDto,
	): Promise<PropertyStatus> {
		return this.propertyStatusService.updatePropertyStatus(
			name,
			updatePropertyStatusDto,
		);
	}

	@Delete(':name')
	@ApiOkResponse({
		description: 'Deletes a property Status that matches the Status name',
		type: PropertyPeripheralDto,
	})
	async deletePropertyStatus(@Param('name') name: string): Promise<void> {
		return this.propertyStatusService.deletePropertyStatus(name);
	}
}
