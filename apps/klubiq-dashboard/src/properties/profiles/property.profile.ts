import {
	CamelCaseNamingConvention,
	Mapper,
	MappingProfile,
	createMap,
	forMember,
	mapFrom,
	mapWith,
	namingConventions,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Property } from '../entities/property.entity';
import {
	AmenityDto,
	CreatePropertyDto,
	ImageDto,
} from '../dto/requests/create-property.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import {
	PropertyDto,
	PropertyUnitDto,
} from '../dto/responses/property-response.dto';
import { CreateAddressDto } from '../dto/requests/create-address.dto';
import { PropertyAddress } from '../entities/property-address.entity';
import { Amenity } from '@app/common/database/entities/property-amenity.entity';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { PropertyPurpose } from '@app/common';
import { MetadataDto } from '../dto/responses/metadata.dto';

export class PropertyProfile extends AutomapperProfile {
	constructor(@InjectMapper('MAPPER') mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(mapper, PropertyPurpose, MetadataDto);
			createMap(mapper, CreatePropertyDto, Property);
			createMap(mapper, UpdatePropertyDto, Property);
			createMap(
				mapper,
				Property,
				PropertyDto,
				forMember(
					(d) => d.units,
					mapWith(PropertyUnitDto, Property, (s) => s.units),
				),
				forMember(
					(d) => d.images,
					mapFrom((s) => s.images.map((i) => i.url)),
				),
				forMember(
					(d) => d.amenities,
					mapFrom((s) => s.amenities.map((i) => i.name)),
				),
				forMember(
					(d) => d.tags,
					mapFrom((s) => s.tags),
				),
				forMember(
					(d) => d.area,
					mapFrom((s) => s.area),
				),
				namingConventions(new CamelCaseNamingConvention()),
			);
			createMap(mapper, Property, PropertyUnitDto);
			createMap(mapper, CreateAddressDto, PropertyAddress);
			createMap(mapper, ImageDto, PropertyImage);
			createMap(mapper, AmenityDto, Amenity);
		};
	}
}
