import {
	Controller,
	Post,
	Get,
	Put,
	Delete,
	Param,
	Body,
} from '@nestjs/common';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
	PropertiesPurposeService,
	PropertiesStatusService,
	PropertiesTypeService,
	PropertyCategory,
	PropertyPurpose,
	PropertyStatus,
	PropertyType,
} from '@app/common';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../../dto/create-property-metadata.dto';
import { PropertiesCategoryService } from '../../services/properties-category.service';
import { PropertyMetadataDto } from '../../dto/properties-metadata.dto';
import { Auth, AuthType } from '@app/auth';

@ApiSecurity('ApiKey')
@Auth(AuthType.ApiKey)
@ApiTags('properties-metadata')
@Controller('property-metadata')
export class PropertyMetadataController {
	constructor(
		private readonly propertyCategoryService: PropertiesCategoryService,
		private readonly propertyPurposeService: PropertiesPurposeService,
		private readonly propertyStatusService: PropertiesStatusService,
		private readonly propertyTypeService: PropertiesTypeService,
	) {}

	//#region PROPERTY-CATEGORIES
	@Post('property-categories')
	@ApiOkResponse({
		description: 'Creates a new property category',
		type: PropertyMetadataDto,
	})
	async createPropertyCategory(
		@Body() createPropertyCategoryDto: CreatePropertyMetadataDto,
	): Promise<PropertyCategory> {
		return this.propertyCategoryService.createPropertyCategory(
			createPropertyCategoryDto,
		);
	}

	@Get('property-categories/:id')
	@ApiOkResponse({
		description: 'Returns a new property category that matches the category id',
		type: PropertyMetadataDto,
	})
	async getPropertyCategoryById(
		@Param('id') id: number,
	): Promise<PropertyCategory> {
		return this.propertyCategoryService.getPropertyCategoryById(id);
	}

	@Get('property-categories')
	@ApiOkResponse({
		description: 'Returns all  property categories',
		type: [PropertyMetadataDto],
	})
	async getAllPropertyCategories(): Promise<PropertyMetadataDto[]> {
		const propertyCategories =
			await this.propertyCategoryService.getAllPropertyCategories();
		return propertyCategories;
	}

	@Put('property-categories/:id')
	@ApiOkResponse({
		description: 'Updates a new property category that matches the category id',
		type: PropertyMetadataDto,
	})
	async updatePropertyCategory(
		@Param('id') id: number,
		@Body() updatePropertyCategoryDto: UpdatePropertyMetadataDto,
	): Promise<PropertyCategory> {
		return this.propertyCategoryService.updatePropertyCategory(
			id,
			updatePropertyCategoryDto,
		);
	}

	@Delete('property-categories/:id')
	@ApiOkResponse({
		description: 'Deletes a property category that matches the category id',
		type: PropertyMetadataDto,
	})
	async deletePropertyCategory(@Param('id') id: number): Promise<void> {
		return this.propertyCategoryService.deletePropertyCategory(id);
	}
	//#endregion

	//#region  PROPERTY PURPOSES
	@Post('property-purposes')
	@ApiOkResponse({
		description: 'Creates a new property Purpose',
		type: PropertyMetadataDto,
	})
	async createPropertyPurpose(
		@Body() createPropertyPurposeDto: CreatePropertyMetadataDto,
	): Promise<PropertyPurpose> {
		return this.propertyPurposeService.createPropertyPurpose(
			createPropertyPurposeDto,
		);
	}

	@Get('property-purposes/:id')
	@ApiOkResponse({
		description: 'Returns a new property Purpose that matches the Purpose id',
		type: PropertyMetadataDto,
	})
	async getPropertyPurposeById(
		@Param('id') id: number,
	): Promise<PropertyPurpose> {
		return this.propertyPurposeService.getPropertyPurposeById(id);
	}

	@Get('property-purposes')
	@ApiOkResponse({
		description: 'Returns all  property purpose',
		type: [PropertyMetadataDto],
	})
	async getAllPropertypurpose(): Promise<PropertyMetadataDto[]> {
		const propertypurpose =
			await this.propertyPurposeService.getAllPropertyPurpose();
		return propertypurpose;
	}

	@Put('property-purposes/:id')
	@ApiOkResponse({
		description: 'Updates a new property Purpose that matches the Purpose id',
		type: PropertyMetadataDto,
	})
	async updatePropertyPurpose(
		@Param('id') id: number,
		@Body() updatePropertyPurposeDto: UpdatePropertyMetadataDto,
	): Promise<PropertyPurpose> {
		return this.propertyPurposeService.updatePropertyPurpose(
			id,
			updatePropertyPurposeDto,
		);
	}

	@Delete('property-purposes/:id')
	@ApiOkResponse({
		description: 'Deletes a property Purpose that matches the Purpose id',
		type: PropertyMetadataDto,
	})
	async deletePropertyPurpose(@Param('id') id: number): Promise<void> {
		return this.propertyPurposeService.deletePropertyPurpose(id);
	}
	//#endregion

	//#region  PROPERTY STATUSES
	@Post('property-statuses')
	@ApiOkResponse({
		description: 'Creates a new property Status',
		type: PropertyMetadataDto,
	})
	async createPropertyStatus(
		@Body() createPropertyStatusDto: CreatePropertyMetadataDto,
	): Promise<PropertyStatus> {
		return this.propertyStatusService.createPropertyStatus(
			createPropertyStatusDto,
		);
	}

	@Get('property-statuses/:id')
	@ApiOkResponse({
		description: 'Returns a new property Status that matches the Status id',
		type: PropertyMetadataDto,
	})
	async getPropertyStatusById(
		@Param('id') id: number,
	): Promise<PropertyStatus> {
		return this.propertyStatusService.getPropertyStatusById(id);
	}

	@Get('property-statuses')
	@ApiOkResponse({
		description: 'Returns all  available property Statuss',
		type: [PropertyMetadataDto],
	})
	async getAllPropertyStatuss(): Promise<PropertyMetadataDto[]> {
		const propertyStatuss =
			await this.propertyStatusService.getAllPropertyStatus();
		return propertyStatuss;
	}

	@Put('property-statuses/:id')
	@ApiOkResponse({
		description: 'Updates a new property Status that matches the Status id',
		type: PropertyMetadataDto,
	})
	async updatePropertyStatus(
		@Param('id') id: number,
		@Body() updatePropertyStatusDto: UpdatePropertyMetadataDto,
	): Promise<PropertyStatus> {
		return this.propertyStatusService.updatePropertyStatus(
			id,
			updatePropertyStatusDto,
		);
	}

	@Delete('property-statuses/:id')
	@ApiOkResponse({
		description: 'Deletes a property Status that matches the Status id',
		type: PropertyMetadataDto,
	})
	async deletePropertyStatus(@Param('id') id: number): Promise<void> {
		return this.propertyStatusService.deletePropertyStatus(id);
	}
	//#endregion

	//#region PROPERTY TYPES
	@Post('property-types')
	@ApiOkResponse({
		description: 'Creates a new property Type',
		type: PropertyMetadataDto,
	})
	async createPropertyType(
		@Body() createPropertyTypeDto: CreatePropertyMetadataDto,
	): Promise<PropertyType> {
		return this.propertyTypeService.createPropertyType(createPropertyTypeDto);
	}

	@Get('property-types/:id')
	@ApiOkResponse({
		description: 'Returns a new property Type that matches the Type id',
		type: PropertyMetadataDto,
	})
	async getPropertyTypeById(@Param('id') id: number): Promise<PropertyType> {
		return this.propertyTypeService.getPropertyTypeById(id);
	}

	@Get('property-types')
	@ApiOkResponse({
		description: 'Returns all  property types',
		type: [PropertyMetadataDto],
	})
	async getAllPropertytypes(): Promise<PropertyMetadataDto[]> {
		const propertytypes = await this.propertyTypeService.getAllPropertyTypes();
		return propertytypes;
	}

	@Put('property-types/:id')
	@ApiOkResponse({
		description: 'Updates a new property Type that matches the Type id',
		type: PropertyMetadataDto,
	})
	async updatePropertyType(
		@Param('id') id: number,
		@Body() updatePropertyTypeDto: UpdatePropertyMetadataDto,
	): Promise<PropertyType> {
		return this.propertyTypeService.updatePropertyType(
			id,
			updatePropertyTypeDto,
		);
	}

	@Delete('property-types/:id')
	@ApiOkResponse({
		description: 'Deletes a property Type that matches the Type id',
		type: PropertyMetadataDto,
	})
	async deletePropertyType(@Param('id') id: number): Promise<void> {
		return this.propertyTypeService.deletePropertyType(id);
	}
	//#endregion
}
