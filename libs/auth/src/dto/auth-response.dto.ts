import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsJWT, IsNumber, IsString } from 'class-validator';

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
	systemRoleName: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	orgRoleName: string;

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
	@IsBoolean()
	isAccountVerified: boolean;

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
	firebaseId: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	organizationUserUuid: string;

	@AutoMap()
	@ApiProperty()
	@IsNumber()
	organizationUserId: number;

	@AutoMap()
	@ApiProperty()
	@IsNumber()
	organizationId: number;

	@AutoMap()
	@ApiProperty()
	@IsString()
	organizationName: string;
}
