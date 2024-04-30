import { Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { PropertyCategory } from '../database/entities/property-category.entity';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../dto/create-property-metadata.dto';
import { PropertyType } from '../database/entities/property-type.entity';
import { PropertyStatus } from '../database/entities/property-status.entity';
import { PropertyPurpose } from '../database/entities/property-purpose.entity';
import { PropertyMetadataDto } from '../dto/properties-metadata.dto';

export class PropertyMetaDataProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			const mappings: Array<[new () => any, new () => any]> = [
				[CreatePropertyMetadataDto, PropertyCategory],
				[UpdatePropertyMetadataDto, PropertyCategory],
				[PropertyMetadataDto, PropertyCategory],
				[CreatePropertyMetadataDto, PropertyType],
				[UpdatePropertyMetadataDto, PropertyType],
				[PropertyMetadataDto, PropertyType],
				[CreatePropertyMetadataDto, PropertyStatus],
				[UpdatePropertyMetadataDto, PropertyStatus],
				[PropertyMetadataDto, PropertyStatus],
				[CreatePropertyMetadataDto, PropertyPurpose],
				[UpdatePropertyMetadataDto, PropertyPurpose],
				[PropertyMetadataDto, PropertyPurpose],
			];

			mappings.forEach(([dto, entity]) => {
				createMap(mapper, dto, entity);
			});
		};
	}
}
