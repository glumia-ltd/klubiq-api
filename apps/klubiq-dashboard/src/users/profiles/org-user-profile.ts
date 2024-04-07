import {
	Mapper,
	MappingProfile,
	createMap,
	forMember,
	forSelf,
	mapFrom,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { UserProfile } from '@app/common';
import { UserResponseDto } from '../dto/create-organization-user.dto';
import { OrganizationUser } from '../entities/organization-user.entity';

export class OrgUserMapProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
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
					(d) => d.systemRoleName,
					mapFrom((s) => s.profile?.systemRole?.name),
				),
				forMember(
					(d) => d.organizationId,
					mapFrom((s) => s.organization?.organizationId),
				),
				forMember(
					(d) => d.organizationName,
					mapFrom((s) => s.organization?.name),
				),
			);
		};
	}
}
