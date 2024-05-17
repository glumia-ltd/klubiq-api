import {
	Mapper,
	MappingProfile,
	Resolver,
	createMap,
	forMember,
	mapFrom,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { UserProfile } from '@app/common';
import { AuthUserResponseDto } from './../dto/auth-response.dto';

export const featurePermissionResolver: Resolver<
	UserProfile,
	AuthUserResponseDto,
	Record<string, string>
> = {
	resolve: (data): Record<string, string> => {
		const resolved = data.organizationUser?.orgRole?.featurePermissions?.map(
			(fp) => {
				return {
					[fp.feature.name]: fp.permission.name,
				};
			},
		);
		return resolved ? Object.assign({}, ...resolved) : {};
	},
};
export class OrgUserProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper) => {
			createMap(
				mapper,
				UserProfile,
				AuthUserResponseDto,
				forMember(
					(d) => d.fbId,
					mapFrom((s) => s.firebaseId),
				),
				forMember(
					(d) => d.firstName,
					mapFrom((s) => s.organizationUser?.firstName),
				),
				forMember(
					(d) => d.lastName,
					mapFrom((s) => s.organizationUser?.lastName),
				),
				forMember(
					(d) => d.organizationUserUuid,
					mapFrom((s) => s.organizationUser?.organizationUserUuid),
				),
				forMember(
					(d) => d.organizationUserId,
					mapFrom((s) => s.organizationUser?.organizationUserId),
				),
				forMember(
					(d) => d.isAccountVerified,
					mapFrom((s) => s.organizationUser?.isAccountVerified),
				),
				forMember(
					(d) => d.companyRole,
					mapFrom((s) => s.organizationUser?.orgRole?.name),
				),
				forMember(
					(d) => d.systemRole,
					mapFrom((s) => s.systemRole?.name),
				),
				forMember(
					(d) => d.company,
					mapFrom((s) => s.organizationUser?.organization?.name),
				),
				forMember(
					(d) => d.companyId,
					mapFrom((s) => s.organizationUser?.organization?.organizationId),
				),
				forMember(
					(d) => d.companyUuid,
					mapFrom((s) => s.organizationUser?.organization?.organizationUuid),
				),
				forMember((d) => d.entitlements, mapFrom(featurePermissionResolver)),
			);
		};
	}
}
