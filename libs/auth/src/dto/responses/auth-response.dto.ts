import { AutoMap } from '@automapper/classes';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsJSON,
	IsJWT,
	IsNotEmpty,
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
	phoneNumber: string;

	@AutoMap()
	@ApiProperty()
	postalCode: string;

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
	tenantUuid?: string;
}

export class TokenResponseDto {
	access_token?: string;
	expires_in?: string;
	token_type?: string;
	refresh_token?: string;
	id_token?: string;
	user_id?: string;
	project_id?: string;
	message?: string;
	factors?: string[];
}

export class MFAResponseDto {
	message: string;
	mfaPendingCredential: string;
	mfaEnrollmentId: string;
}

export class VerifyMfaOtpDto {
	@ApiProperty({
		description: 'MFA OTP',
		example: '123456',
	})
	@IsString()
	@IsNotEmpty()
	otp: string;

	@ApiProperty({
		description: 'MFA Enrollment ID',
		required: false,
	})
	@IsString()
	@IsOptional()
	mfaEnrollmentId?: string;

	@ApiProperty({
		description: 'MFA Pending Credential',
		required: false,
	})
	@IsString()
	@IsOptional()
	mfaPendingCredential?: string;
}
export class VerifyMfaOtpResponseDto {
	idToken?: string;
	refreshToken?: string;
}

export class SignInByFireBaseResponseDto {
	idToken?: string;
	expiresIn?: string;
	tokenType?: string; // inferred – not in the object but commonly "Bearer"
	refreshToken?: string;
	localId?: string;
	email?: string;
	displayName?: string;
	kind: string;
	registered: boolean;
	mfaPendingCredential?: string;
	mfaInfo?: [
		{
			mfaEnrollmentId: string;
			displayName: string;
			enrolledAt: string;
		},
	];
}

export class LandlordUserDetailsResponseDto {
	@Expose()
	@IsString()
	uuid: string;

	@Expose()
	@IsString()
	profileUuid: string;

	@Expose()
	@IsString()
	firebaseId: string;

	@Expose()
	@IsString()
	organization: string;

	@Expose()
	@IsString()
	organizationUuid: string;

	@Expose()
	@IsString()
	tenantId: string;

	@Expose()
	@IsString()
	email: string;

	// @Expose()
	// @IsJSON()
	// entitlements: Record<string, string>;

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

	// @Expose()
	// @IsJSON()
	// @IsOptional()
	// orgSettings?: Record<string, any>;

	// @Expose()
	// @IsOptional()
	// orgSubscription?: {
	// 	isFreeTrial: boolean;
	// 	planId: number;
	// };

	@Expose()
	@IsString()
	role: string;

	@Expose()
	@IsArray()
	mfaFactors?: string[];

	@Expose()
	@IsJSON()
	@IsOptional()
	notificationSubscription?: Record<string, any>;
}

export class TenantUserDetailsResponseDto {
	@Expose()
	@IsString()
	uuid: string;

	@Expose()
	@IsString()
	profileUuid: string;

	@Expose()
	@IsString()
	firebaseId: string;

	@Expose()
	@IsString()
	email: string;

	@Expose()
	@IsString()
	firstName: string;

	@Expose()
	@IsString()
	lastName: string;

	@Expose()
	@IsBoolean()
	isActive: boolean;

	@Expose()
	@IsString()
	companyName: string;

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
	role: string;

	@Expose()
	@IsJSON()
	@IsOptional()
	preferences?: Record<string, any>;

	@Expose()
	@IsJSON()
	@IsOptional()
	notificationSubscription?: Record<string, any>;
}

export class LoginResponseDto extends IntersectionType(
	LandlordUserDetailsResponseDto,
	TenantUserDetailsResponseDto,
) {}
