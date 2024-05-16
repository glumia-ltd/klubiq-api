import { Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dto/requests/create-property.dto';
import { UpdatePropertyDto } from '../dto/requests/update-property.dto';
import { PropertyDto } from '../dto/property-response.dto';

export class PropertyProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(mapper, CreatePropertyDto, Property);
			createMap(mapper, UpdatePropertyDto, Property);
			createMap(mapper, Property, PropertyDto);
		};
	}
}
