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

	@Post()
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

	@Get(':name')
	@ApiOkResponse({
		description:
			'Returns a new property category that matches the category name',
		type: PropertyMetadataDto,
	})
	async getPropertyCategoryByName(
		@Param('name') name: string,
	): Promise<PropertyCategory> {
		return this.propertyCategoryService.getPropertyCategoryByName(name);
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

	@Put(':name')
	@ApiOkResponse({
		description:
			'Updates a new property category that matches the category name',
		type: PropertyMetadataDto,
	})
	async updatePropertyCategory(
		@Param('name') name: string,
		@Body() updatePropertyCategoryDto: UpdatePropertyMetadataDto,
	): Promise<PropertyCategory> {
		return this.propertyCategoryService.updatePropertyCategory(
			name,
			updatePropertyCategoryDto,
		);
	}

	@Delete(':name')
	@ApiOkResponse({
		description: 'Deletes a property category that matches the category name',
		type: PropertyMetadataDto,
	})
	async deletePropertyCategory(@Param('name') name: string): Promise<void> {
		return this.propertyCategoryService.deletePropertyCategory(name);
	}
}
