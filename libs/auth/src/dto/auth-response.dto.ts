import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class SignUpResponseDto {
	@ApiProperty({
		description: 'jwt auth token',
		example: 'a jwt token',
	})
	@IsJWT()
	jwtToken: string;
}

export class AuthUserResponseDto {
	@AutoMap()
	@ApiProperty()
	addressLine2: string;

	@AutoMap()
	@ApiProperty()
	bio: string;

	@AutoMap()
	@ApiProperty()
	city: string;

	@AutoMap()
	@ApiProperty()
	company?: string;

	@AutoMap()
	@ApiProperty()
	companyId?: number;

	@AutoMap()
	@ApiProperty()
	companyRole?: string;

	@AutoMap()
	@ApiProperty()
	companyuuid?: number;

	@AutoMap()
	@ApiProperty()
	countryPhoneCode: string;

	@AutoMap()
	@ApiProperty()
	country: string;

	@AutoMap()
	@ApiProperty()
	dateOfBirth: string;

	@AutoMap()
	@ApiProperty()
	email: string;

	@AutoMap()
	@ApiProperty()
	fbId: string;

	@AutoMap()
	@ApiProperty()
	entitlements?: Record<string, string>;

	@AutoMap()
	@ApiProperty()
	firstName: string;

	@AutoMap()
	@ApiProperty()
	formOfIdentity: string;

	@AutoMap()
	@ApiProperty()
	gender: string;

	@AutoMap()
	@ApiProperty()
	isAccountVerified: boolean;

	@AutoMap()
	@ApiProperty()
	isPrivacyPolicyAgreed?: boolean;

	@AutoMap()
	@ApiProperty()
	isTermsAndConditionAccepted?: boolean;

	@AutoMap()
	@ApiProperty()
	lastName: string;

	@AutoMap()
	@ApiProperty()
	organizationUserUuid?: string;

	@AutoMap()
	@ApiProperty()
	organizationUserId?: number;

	@AutoMap()
	@ApiProperty()
	phoneNumber: string;

	@AutoMap()
	@ApiProperty()
	postalCode: string;

	@AutoMap()
	@ApiProperty()
	profileId: number;

	@AutoMap()
	@ApiProperty()
	profilePicUrl: string;

	@AutoMap()
	@ApiProperty()
	profileUuid: string;

	@AutoMap()
	@ApiProperty()
	state: string;

	@AutoMap()
	@ApiProperty()
	street: string;

	@AutoMap()
	@ApiProperty()
	systemRole: string;

	@AutoMap()
	@ApiProperty()
	tenantId?: number;

	@AutoMap()
	@ApiProperty()
	tenantUuid?: string;
}
