import {
	Mapper,
	MappingProfile,
	createMap,
	forMember,
	forSelf,
	mapFrom,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import { UserResponseDto } from '../dto/create-organization-user.dto';
import { OrganizationUser } from '@app/common/database/entities/organization-user.entity';

export class OrgUserMapProfile extends AutomapperProfile {
	constructor(@InjectMapper('MAPPER') mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(
				mapper,
				OrganizationUser,
				UserResponseDto,
				forSelf(UserProfile, (s) => s.profile),
				forMember(
					(d) => d.orgRoleName,
					mapFrom((s) => s.orgRole?.name),
				),
				forMember(
					(d) => d.organizationName,
					mapFrom((s) => s.organization?.name),
				),
			);
		};
	}
}
