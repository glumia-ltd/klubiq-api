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
import { PropertyType } from '@app/common';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../../../../../libs/common/src/dto/create-property-metadata.dto';
import { PropertyMetadataDto } from '../../../../../libs/common/src/dto/properties-metadata.dto';
import { PropertiesTypeService } from '../../../../../libs/common/src/services/properties-type.service';

@ApiBearerAuth()
@ApiTags('properties-types')
@Controller('property-types')
export class PropertyTypeController {
	constructor(private readonly propertyTypeService: PropertiesTypeService) {}

	@Post()
	@ApiOkResponse({
		description: 'Creates a new property Type',
		type: PropertyMetadataDto,
	})
	async createPropertyType(
		@Body() createPropertyTypeDto: CreatePropertyMetadataDto,
	): Promise<PropertyType> {
		return this.propertyTypeService.createPropertyType(createPropertyTypeDto);
	}

	@Get(':name')
	@ApiOkResponse({
		description: 'Returns a new property Type that matches the Type name',
		type: PropertyMetadataDto,
	})
	async getPropertyTypeByName(
		@Param('name') name: string,
	): Promise<PropertyType> {
		return this.propertyTypeService.getPropertyTypeByName(name);
	}

	@Get()
	@ApiOkResponse({
		description: 'Returns all  property types',
		type: [PropertyMetadataDto],
	})
	async getAllPropertytypes(): Promise<PropertyMetadataDto[]> {
		const propertytypes = await this.propertyTypeService.getAllPropertyTypes();
		return propertytypes;
	}

	@Put(':name')
	@ApiOkResponse({
		description: 'Updates a new property Type that matches the Type name',
		type: PropertyMetadataDto,
	})
	async updatePropertyType(
		@Param('name') name: string,
		@Body() updatePropertyTypeDto: UpdatePropertyMetadataDto,
	): Promise<PropertyType> {
		return this.propertyTypeService.updatePropertyType(
			name,
			updatePropertyTypeDto,
		);
	}

	@Delete(':name')
	@ApiOkResponse({
		description: 'Deletes a property Type that matches the Type name',
		type: PropertyMetadataDto,
	})
	async deletePropertyType(@Param('name') name: string): Promise<void> {
		return this.propertyTypeService.deletePropertyType(name);
	}
}
