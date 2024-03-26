import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsJWT, IsNumber, IsString } from 'class-validator';

export class SignUpResponseDto {
	@ApiProperty({
		description: 'jwt auth token',
		example: 'a jwt token',
	})
	@IsJWT()
	jwtToken: string;
}

export class RenterLoginResponseDto {
	@AutoMap()
	@ApiProperty()
	@IsNumber()
	profileId: number;

	@AutoMap()
	@ApiProperty()
	@IsString()
	profileUuid: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	firstName: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	lastName: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	email: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	systemRole: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	orgRole: string;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isDeleted: boolean;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isActive: boolean;

	@AutoMap()
	@ApiProperty()
	@IsString()
	profilePicUrl: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	phoneNumber: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	countryPhoneCode: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	street: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	addressLine2: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	state: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	city: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	country: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	postalCode: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	formOfIdentity: string;

	@AutoMap()
	@ApiProperty()
	@IsDate()
	dateOfBirth: Date;

	@AutoMap()
	@ApiProperty()
	@IsString()
	gender: string;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isAccountVerified: boolean;

	@AutoMap()
	@ApiProperty()
	@IsString()
	bio: string;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isTermsAndConditionAccepted?: boolean;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isPrivacyPolicyAgreed?: boolean;

	@AutoMap()
	@ApiProperty()
	@IsString()
	_id: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	userUuid: string;

	@AutoMap()
	@ApiProperty()
	@IsNumber()
	userId: number;

	@AutoMap()
	@ApiProperty()
	@IsNumber()
	organizationId: number;

	@AutoMap()
	@ApiProperty()
	@IsString()
	organizationName: string;
}
