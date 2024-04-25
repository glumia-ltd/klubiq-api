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
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../../../../../libs/common/src/dto/create-property-metadata.dto';
import { PropertyMetadataDto } from '../../../../../libs/common/src/dto/properties-metadata.dto';
import { PropertiesPurposeService } from '../../../../../libs/common/src/services/properties-purpose.service';

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
		type: PropertyMetadataDto,
	})
	async createPropertyPurpose(
		@Body() createPropertyPurposeDto: CreatePropertyMetadataDto,
	): Promise<PropertyPurpose> {
		return this.propertyPurposeService.createPropertyPurpose(
			createPropertyPurposeDto,
		);
	}

	@Get(':name')
	@ApiOkResponse({
		description: 'Returns a new property Purpose that matches the Purpose name',
		type: PropertyMetadataDto,
	})
	async getPropertyPurposeByName(
		@Param('name') name: string,
	): Promise<PropertyPurpose> {
		return this.propertyPurposeService.getPropertyPurposeByName(name);
	}

	@Get()
	@ApiOkResponse({
		description: 'Returns all  property purpose',
		type: [PropertyMetadataDto],
	})
	async getAllPropertypurpose(): Promise<PropertyMetadataDto[]> {
		const propertypurpose =
			await this.propertyPurposeService.getAllPropertyPurpose();
		return propertypurpose;
	}

	@Put(':name')
	@ApiOkResponse({
		description: 'Updates a new property Purpose that matches the Purpose name',
		type: PropertyMetadataDto,
	})
	async updatePropertyPurpose(
		@Param('name') name: string,
		@Body() updatePropertyPurposeDto: UpdatePropertyMetadataDto,
	): Promise<PropertyPurpose> {
		return this.propertyPurposeService.updatePropertyPurpose(
			name,
			updatePropertyPurposeDto,
		);
	}

	@Delete(':name')
	@ApiOkResponse({
		description: 'Deletes a property Purpose that matches the Purpose name',
		type: PropertyMetadataDto,
	})
	async deletePropertyPurpose(@Param('name') name: string): Promise<void> {
		return this.propertyPurposeService.deletePropertyPurpose(name);
	}
}
