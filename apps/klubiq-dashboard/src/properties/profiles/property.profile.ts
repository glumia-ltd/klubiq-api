import { Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Property } from '../entities/property.entity';
import {
	AmenityDto,
	CreatePropertyDto,
	ImageDto,
} from '../dto/requests/create-property.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import { PropertyDto } from '../dto/responses/property-response.dto';
import { CreateAddressDto } from '../dto/requests/create-address.dto';
import { PropertyAddress } from '../entities/property-address.entity';
import { Amenity } from '@app/common/database/entities/property-amenity.entity';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';

export class PropertyProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(mapper, CreatePropertyDto, Property);
			createMap(mapper, UpdatePropertyDto, Property);
			createMap(mapper, Property, PropertyDto);
			createMap(mapper, CreateAddressDto, PropertyAddress);
			createMap(mapper, ImageDto, PropertyImage);
			createMap(mapper, AmenityDto, Amenity);
		};
	}
}
