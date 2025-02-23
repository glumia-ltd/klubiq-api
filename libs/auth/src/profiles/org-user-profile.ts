import {
	Mapper,
	MappingProfile,
	Resolver,
	createMap,
	forMember,
	mapFrom,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import { AuthUserResponseDto } from '../dto/responses/auth-response.dto';

export const featurePermissionResolver: Resolver<
	UserProfile,
	AuthUserResponseDto,
	Record<string, string>
> = {
	resolve: (data): Record<string, string> => {
		const resolved =
			data.organizationUser?.orgRole?.roleFeaturePermissions?.map((fp) => {
				return {
					[fp.featurePermission.feature.name]:
						fp.featurePermission.permission.name,
				};
			});
		return resolved ? Object.assign({}, ...resolved) : {};
	},
};
export class OrgUserProfile extends AutomapperProfile {
	constructor(@InjectMapper('MAPPER') mapper: Mapper) {
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
					(d) => d.organizationUserUuid,
					mapFrom((s) => s.organizationUser?.organizationUserUuid),
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
					(d) => d.company,
					mapFrom((s) => s.organizationUser?.organization?.name),
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
