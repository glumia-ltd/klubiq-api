import {
	Mapper,
	MappingProfile,
	createMap,
	forMember,
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
				UserProfile,
				UserResponseDto,
				forMember(
					(d) => d.firstName,
					mapFrom((s) => s.organizationUser?.firstName),
				),
				forMember(
					(d) => d.lastName,
					mapFrom((s) => s.organizationUser?.lastName),
				),
				forMember(
					(d) => d.orgRole,
					mapFrom((s) => s.organizationUser?.orgRole?.name),
				),
				forMember(
					(d) => d.systemRole,
					mapFrom((s) => s.systemRole?.name),
				),
				forMember(
					(d) => d._id,
					mapFrom((s) => s.firebaseId),
				),
				forMember(
					(d) => d.isAccountVerified,
					mapFrom((s) => s.organizationUser?.isAccountVerified),
				),
				forMember(
					(d) => d.userId,
					mapFrom((s) => s.organizationUser?.organizationUserId),
				),
				forMember(
					(d) => d.userUuid,
					mapFrom((s) => s.organizationUser?.organizationUserUuid),
				),
				forMember(
					(d) => d.organizationId,
					mapFrom((s) => s.organizationUser?.organization?.organizationId),
				),
				forMember(
					(d) => d.organizationName,
					mapFrom((s) => s.organizationUser?.organization?.name),
				),
			),
				createMap(
					mapper,
					OrganizationUser,
					UserResponseDto,
					forMember(
						(d) => d.profilePicUrl,
						mapFrom((s) => s.profile?.profilePicUrl),
					),
					forMember(
						(d) => d.email,
						mapFrom((s) => s.profile?.email),
					),
					forMember(
						(d) => d.orgRole,
						mapFrom((s) => s.orgRole?.name),
					),
					forMember(
						(d) => d.systemRole,
						mapFrom((s) => s.profile?.systemRole?.name),
					),
					forMember(
						(d) => d._id,
						mapFrom((s) => s.firebaseId),
					),
					forMember(
						(d) => d.isTermsAndConditionAccepted,
						mapFrom((s) => s.profile?.isTermsAndConditionAccepted),
					),
					forMember(
						(d) => d.isPrivacyPolicyAgreed,
						mapFrom((s) => s.profile?.isPrivacyPolicyAgreed),
					),
					forMember(
						(d) => d.phoneNumber,
						mapFrom((s) => s.profile?.phoneNumber),
					),
					forMember(
						(d) => d.countryPhoneCode,
						mapFrom((s) => s.profile?.countryPhoneCode),
					),
					forMember(
						(d) => d.bio,
						mapFrom((s) => s.profile?.bio),
					),
					forMember(
						(d) => d.dateOfBirth,
						mapFrom((s) => s.profile?.dateOfBirth),
					),
					forMember(
						(d) => d.profileId,
						mapFrom((s) => s.profile?.profileId),
					),
					forMember(
						(d) => d.profileUuid,
						mapFrom((s) => s.profile?.profileUuid),
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
