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
import { PropertyPurpose } from '@app/common';
import {
	CreatePropertyCategoryDto,
	UpdatePropertyCategoryDto,
} from '../dto/property-category.dto';
import { PropertyPeripheralDto } from '../dto/properties-peripheral.dto';
import { PropertiesPurposeService } from '../services/properties-purpose.service';

@ApiBearerAuth()
@ApiTags('properties-purpose')
@Controller('property-purpose')
export class PropertyPurposeController {
	constructor(
		private readonly propertyPurposeService: PropertiesPurposeService,
	) {}

	@Post()
	@ApiOkResponse({
		description: 'Creates a new property Purpose',
		type: PropertyPeripheralDto,
	})
	async createPropertyPurpose(
		@Body() createPropertyPurposeDto: CreatePropertyCategoryDto,
	): Promise<PropertyPurpose> {
		return this.propertyPurposeService.createPropertyPurpose(
			createPropertyPurposeDto,
		);
	}

	@Get(':name')
	@ApiOkResponse({
		description: 'Returns a new property Purpose that matches the Purpose name',
		type: PropertyPeripheralDto,
	})
	async getPropertyPurposeByName(
		@Param('name') name: string,
	): Promise<PropertyPurpose> {
		return this.propertyPurposeService.getPropertyPurposeByName(name);
	}

	@Get()
	@ApiOkResponse({
		description: 'Returns all  property purpose',
		type: [PropertyPeripheralDto],
	})
	async getAllPropertypurpose(): Promise<PropertyPeripheralDto[]> {
		const propertypurpose =
			await this.propertyPurposeService.getAllPropertyPurpose();
		return propertypurpose;
	}

	@Put(':name')
	@ApiOkResponse({
		description: 'Updates a new property Purpose that matches the Purpose name',
		type: PropertyPeripheralDto,
	})
	async updatePropertyPurpose(
		@Param('name') name: string,
		@Body() updatePropertyPurposeDto: UpdatePropertyCategoryDto,
	): Promise<PropertyPurpose> {
		return this.propertyPurposeService.updatePropertyPurpose(
			name,
			updatePropertyPurposeDto,
		);
	}

	@Delete(':name')
	@ApiOkResponse({
		description: 'Deletes a property Purpose that matches the Purpose name',
		type: PropertyPeripheralDto,
	})
	async deletePropertyPurpose(@Param('name') name: string): Promise<void> {
		return this.propertyPurposeService.deletePropertyPurpose(name);
	}
}
