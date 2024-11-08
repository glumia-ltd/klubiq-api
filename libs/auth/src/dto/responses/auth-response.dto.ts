import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
	IsBoolean,
	IsJSON,
	IsJWT,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

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
	companyUuid?: string;

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

export class TokenResponseDto {
	access_token: string;
	expires_in: string;
	token_type: string;
	refresh_token: string;
	id_token: string;
	user_id: string;
	project_id: string;
}

export class LandlordUserDetailsResponseDto {
	@Expose()
	@IsString()
	uuid: string;

	@Expose()
	@IsNumber()
	id: number;

	@Expose()
	@IsString()
	organization: string;

	@Expose()
	@IsNumber()
	organizationId: number;

	@Expose()
	@IsString()
	organizationUuid: string;

	@Expose()
	@IsString()
	email: string;

	@Expose()
	@IsJSON()
	entitlements: Record<string, string>;

	@Expose()
	@IsString()
	firstName: string;

	@Expose()
	@IsString()
	lastName: string;

	@Expose()
	@IsBoolean()
	isAccountVerified: boolean;

	@Expose()
	@IsBoolean()
	isPrivacyPolicyAgreed: boolean;

	@Expose()
	@IsBoolean()
	isTermsAndConditionAccepted: boolean;

	@Expose()
	@IsString()
	@IsOptional()
	phone?: string;

	@Expose()
	@IsString()
	@IsOptional()
	profilePicUrl?: string;

	@Expose()
	@IsString()
	roleName: string;

	@Expose()
	@IsJSON()
	@IsOptional()
	preferences?: Record<string, any>;

	@Expose()
	@IsJSON()
	@IsOptional()
	orgSettings?: Record<string, any>;

	@Expose()
	@IsOptional()
	orgSubscription?: {
		isFreeTrial: boolean;
		planId: number;
	};
}
