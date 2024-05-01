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
			createMap(mapper, PropertyCategory, CreatePropertyMetadataDto);
			createMap(mapper, PropertyCategory, UpdatePropertyMetadataDto);
			createMap(mapper, PropertyCategory, PropertyMetadataDto);

			createMap(mapper, PropertyType, CreatePropertyMetadataDto);
			createMap(mapper, PropertyType, UpdatePropertyMetadataDto);
			createMap(mapper, PropertyType, PropertyMetadataDto);

			createMap(mapper, PropertyStatus, CreatePropertyMetadataDto);
			createMap(mapper, PropertyStatus, UpdatePropertyMetadataDto);
			createMap(mapper, PropertyStatus, PropertyMetadataDto);

			createMap(mapper, PropertyPurpose, CreatePropertyMetadataDto);
			createMap(mapper, PropertyPurpose, UpdatePropertyMetadataDto);
			createMap(mapper, PropertyPurpose, PropertyMetadataDto);
		};
	}
}
