import { Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Property } from '../entities/property.entity';
import {
	AmenityDto,
	CreatePropertyDto,
} from '../dto/requests/create-property.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import { CreateAddressDto } from '../dto/requests/create-address.dto';
import { PropertyAddress } from '../entities/property-address.entity';
import { Amenity } from '@app/common/database/entities/property-amenity.entity';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { PropertyCategory, PropertyPurpose, PropertyType } from '@app/common';
import { MetadataDto } from '../dto/responses/metadata.dto';

export const propertyProfile: MappingProfile = (mapper) => {
	createMap(mapper, PropertyAddress, CreateAddressDto);
};
export class PropertyProfile extends AutomapperProfile {
	constructor(@InjectMapper('MAPPER') mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(mapper, PropertyType, MetadataDto);
			createMap(mapper, PropertyPurpose, MetadataDto);
			createMap(mapper, PropertyImage, MetadataDto);
			createMap(mapper, Amenity, MetadataDto);
			createMap(mapper, PropertyCategory, MetadataDto);
			createMap(mapper, CreatePropertyDto, Property);
			createMap(mapper, UpdatePropertyDto, Property);
			createMap(mapper, CreateAddressDto, PropertyAddress);
			createMap(mapper, AmenityDto, Amenity);
		};
	}
}
