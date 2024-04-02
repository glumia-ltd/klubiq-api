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
import { RenterLoginResponseDto } from './../dto/auth-response.dto';
import { OrganizationUser } from '../../../../apps/klubiq-dashboard/src/users/entities/organization-user.entity';

export class OrgUserProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(
				mapper,
				UserProfile,
				RenterLoginResponseDto,
				forSelf(OrganizationUser, (s) => s.organizationUser),
				forMember(
					(d) => d.orgRoleName,
					mapFrom((s) => s.organizationUser?.orgRole?.name),
				),
				forMember(
					(d) => d.systemRoleName,
					mapFrom((s) => s.systemRole?.name),
				),
				forMember(
					(d) => d.organizationName,
					mapFrom((s) => s.organizationUser?.organization?.name),
				),
			),
				createMap(
					mapper,
					OrganizationUser,
					RenterLoginResponseDto,
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
