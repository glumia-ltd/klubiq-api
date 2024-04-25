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
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../../../../../libs/common/src/dto/create-property-metadata.dto';
import { PropertyMetadataDto } from '../../../../../libs/common/src/dto/properties-metadata.dto';
import { PropertiesStatusService } from '../../../../../libs/common/src/services/properties-status.service';

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
		type: PropertyMetadataDto,
	})
	async createPropertyStatus(
		@Body() createPropertyStatusDto: CreatePropertyMetadataDto,
	): Promise<PropertyStatus> {
		return this.propertyStatusService.createPropertyStatus(
			createPropertyStatusDto,
		);
	}

	@Get(':name')
	@ApiOkResponse({
		description: 'Returns a new property Status that matches the Status name',
		type: PropertyMetadataDto,
	})
	async getPropertyStatusByName(
		@Param('name') name: string,
	): Promise<PropertyStatus> {
		return this.propertyStatusService.getPropertyStatusByName(name);
	}

	@Get()
	@ApiOkResponse({
		description: 'Returns all  property Statuss',
		type: [PropertyMetadataDto],
	})
	async getAllPropertyStatuss(): Promise<PropertyMetadataDto[]> {
		const propertyStatuss =
			await this.propertyStatusService.getAllPropertyStatus();
		return propertyStatuss;
	}

	@Put(':name')
	@ApiOkResponse({
		description: 'Updates a new property Status that matches the Status name',
		type: PropertyMetadataDto,
	})
	async updatePropertyStatus(
		@Param('name') name: string,
		@Body() updatePropertyStatusDto: UpdatePropertyMetadataDto,
	): Promise<PropertyStatus> {
		return this.propertyStatusService.updatePropertyStatus(
			name,
			updatePropertyStatusDto,
		);
	}

	@Delete(':name')
	@ApiOkResponse({
		description: 'Deletes a property Status that matches the Status name',
		type: PropertyMetadataDto,
	})
	async deletePropertyStatus(@Param('name') name: string): Promise<void> {
		return this.propertyStatusService.deletePropertyStatus(name);
	}
}
