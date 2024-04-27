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
import { PropertyCategory } from '@app/common';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../../../../../libs/common/src/dto/create-property-metadata.dto';
import { PropertiesCategoryService } from '../../../../../libs/common/src/services/properties-category.service';
import { PropertyMetadataDto } from '../../../../../libs/common/src/dto/properties-metadata.dto';

@ApiBearerAuth()
@ApiTags('properties-categories')
@Controller('property-categories')
export class PropertyCategoryController {
	constructor(
		private readonly propertyCategoryService: PropertiesCategoryService,
	) {}

	@Post('create')
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

	@Get(':id')
	@ApiOkResponse({
		description: 'Returns a new property category that matches the category id',
		type: PropertyMetadataDto,
	})
	async getPropertyCategoryById(
		@Param('id') id: number,
	): Promise<PropertyCategory> {
		return this.propertyCategoryService.getPropertyCategoryById(id);
	}

	@Get()
	@ApiOkResponse({
		description: 'Returns all  property categories',
		type: [PropertyMetadataDto],
	})
	async getAllPropertyCategories(): Promise<PropertyMetadataDto[]> {
		const propertyCategories =
			await this.propertyCategoryService.getAllPropertyCategories();
		return propertyCategories;
	}

	@Put(':id/update')
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

	@Delete(':id/delete')
	@ApiOkResponse({
		description: 'Deletes a property category that matches the category id',
		type: PropertyMetadataDto,
	})
	async deletePropertyCategory(@Param('id') id: number): Promise<void> {
		return this.propertyCategoryService.deletePropertyCategory(id);
	}
}
