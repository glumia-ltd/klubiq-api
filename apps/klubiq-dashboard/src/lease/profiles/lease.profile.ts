import { Lease } from '@app/common/database/entities/lease.entity';
import {
	addProfile,
	CamelCaseNamingConvention,
	createMap,
	Mapper,
	MappingProfile,
	namingConventions,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { LeaseDto } from '../dto/responses/view-lease.dto';
import { publicProfile } from '@app/common/profiles/common-profile';
import {
	unitsProfile,
	propertyProfile,
} from '../../properties/profiles/property.profile';

export class LeaseProfile extends AutomapperProfile {
	constructor(@InjectMapper('MAPPER') mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(
				mapper,
				Lease,
				LeaseDto,
				namingConventions(new CamelCaseNamingConvention()),
			);
			addProfile(mapper, publicProfile);
			addProfile(mapper, unitsProfile);
			addProfile(mapper, propertyProfile);
		};
	}
}
