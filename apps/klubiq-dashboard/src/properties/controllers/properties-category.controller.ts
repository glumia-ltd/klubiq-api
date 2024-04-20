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
	CreatePropertyCategoryDto,
	UpdatePropertyCategoryDto,
} from '../dto/property-category.dto';
import { PropertiesCategoryService } from '../services/properties-category.service';
import { PropertyPeripheralDto } from '../dto/properties-peripheral.dto';

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
		type: PropertyPeripheralDto,
	})
	async createPropertyCategory(
		@Body() createPropertyCategoryDto: CreatePropertyCategoryDto,
	): Promise<PropertyCategory> {
		return this.propertyCategoryService.createPropertyCategory(
			createPropertyCategoryDto,
		);
	}

	@Get(':name')
	@ApiOkResponse({
		description:
			'Returns a new property category that matches the category name',
		type: PropertyPeripheralDto,
	})
	async getPropertyCategoryByName(
		@Param('name') name: string,
	): Promise<PropertyCategory> {
		return this.propertyCategoryService.getPropertyCategoryByName(name);
	}

	@Get()
	@ApiOkResponse({
		description: 'Returns all  property categories',
		type: [PropertyPeripheralDto],
	})
	async getAllPropertyCategories(): Promise<PropertyPeripheralDto[]> {
		const propertyCategories =
			await this.propertyCategoryService.getAllPropertyCategories();
		return propertyCategories;
	}

	@Put(':name')
	@ApiOkResponse({
		description:
			'Updates a new property category that matches the category name',
		type: PropertyPeripheralDto,
	})
	async updatePropertyCategory(
		@Param('name') name: string,
		@Body() updatePropertyCategoryDto: UpdatePropertyCategoryDto,
	): Promise<PropertyCategory> {
		return this.propertyCategoryService.updatePropertyCategory(
			name,
			updatePropertyCategoryDto,
		);
	}

	@Delete(':name')
	@ApiOkResponse({
		description: 'Deletes a property category that matches the category name',
		type: PropertyPeripheralDto,
	})
	async deletePropertyCategory(@Param('name') name: string): Promise<void> {
		return this.propertyCategoryService.deletePropertyCategory(name);
	}
}
