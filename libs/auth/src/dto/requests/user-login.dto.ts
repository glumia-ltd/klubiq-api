import {
	ApiHideProperty,
	ApiProperty,
	ApiPropertyOptional,
	IntersectionType,
	OmitType,
	PartialType,
} from '@nestjs/swagger';
import { OnboardingLeaseDto } from 'apps/klubiq-dashboard/src/lease/dto/requests/create-lease.dto';
import {
	IsArray,
	IsEmail,
	IsInt,
	IsNumber,
	IsObject,
	IsOptional,
	IsPhoneNumber,
	IsString,
	IsStrongPassword,
	IsUrl,
} from 'class-validator';

/**
 * Represents the data transfer object for user login.
 *
 * @remarks
 * This class is used to encapsulate the user's email and password for login.
 */
export class UserLoginDto {
	@ApiProperty({
		description: "User's email",
		example: 'john.doe@test.com',
	})
	@IsString()
	@IsEmail()
	email: string;

	@ApiProperty({
		description: "User's password",
		example: 'password',
	})
	@IsString()
	password: string;
}

/**
 * Represents a user sign up data transfer object.
 */
export class UserSignUpDto extends PartialType(UserLoginDto) {
	@ApiPropertyOptional({
		description: "User's first name",
		example: 'John',
	})
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({
		description: "User's last name",
		example: 'Doe',
	})
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiProperty({
		description: "User's password",
		example: '123456789',
	})
	@IsString()
	@IsOptional()
	@IsStrongPassword({
		minLength: 6,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password?: string;
}

/**
 * Represents the data transfer object for updating a Firebase user.
 */
export class UpdateFirebaseUserDto extends PartialType(UserSignUpDto) {
	@ApiProperty()
	@IsUrl()
	photoURL: number;

	@ApiProperty()
	@IsPhoneNumber()
	phoneNumber: string;

	@ApiProperty()
	@IsString()
	displayName: string;
}

export class OrganizationCountryDto {
	@ApiProperty({
		description: 'Country Name',
		example: 'Nigeria',
	})
	@IsString()
	name: string;

	@ApiProperty({
		description: 'Country Code',
		example: 'NG',
	})
	@IsString()
	code: string;

	@ApiProperty({
		description: 'Dial Code',
		example: '+234',
	})
	@IsString()
	dialCode: string;

	@ApiProperty({
		description: 'Currency',
		example: 'NGN',
	})
	@IsString()
	currency: string;

	@ApiProperty({
		description: 'Currency symbol',
		example: '&#8358;',
	})
	@IsString()
	currencySymbol: string;

	@ApiProperty({
		description: 'country language',
		example: 'en;',
	})
	@IsString()
	language: string;
}

export class RoleTypeDto {
	@IsInt()
	id: number;

	@IsString()
	name: string;
}

/**
 * Represents the data transfer object for signing up an organization user.
 * Extends the partial type of UserSignUpDto.
 */
export class OrgUserSignUpDto extends PartialType(UserSignUpDto) {
	@ApiProperty({
		description: 'Company name',
		example: 'Acme',
	})
	@IsString()
	companyName: string;

	@ApiProperty({
		type: OrganizationCountryDto,
	})
	@IsObject()
	organizationCountry: OrganizationCountryDto;

	@ApiProperty({
		type: RoleTypeDto,
	})
	@IsObject()
	role: RoleTypeDto;
}

/**
 * Represents the data transfer object for verifying email.
 */
export class VerifyEmailDto {
	@ApiProperty({
		description: 'verification code',
	})
	@IsString()
	oobCode: string;
}

/**
 * Represents a data transfer object for looking up a user.
 */
export class LookUpUserDto {
	@ApiProperty({
		description: 'User email',
	})
	@IsString()
	@IsEmail()
	email: string;
}

/**
 * Data transfer object for sending a verification email to a user.
 */
export class SendVerifyEmailDto {
	@ApiProperty({
		description: 'user email',
	})
	@IsString()
	@IsEmail()
	email: string;

	@ApiProperty({
		description: `user's first name`,
	})
	@IsString()
	firstName: string;

	@ApiProperty({
		description: `user's last name`,
	})
	@IsString()
	lastName: string;
}

/**
 * Represents the data transfer object for exchanging a refresh token.
 */
export class RefreshTokenExchangeDto {
	@ApiProperty({
		description: 'refresh token',
	})
	@IsString()
	@IsOptional()
	refreshToken?: string;
}

/**
 * Represents the data transfer object for resetting password link.
 */
export class ResetPasswordLinkDto {
	@ApiProperty()
	@IsString()
	@IsEmail()
	email: string;
}
/**
 * Represents the data transfer object for the password field.
 */
export class PasswordDto {
	@ApiProperty()
	@IsString()
	@IsStrongPassword({
		minLength: 6,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password: string;
}
/**
 * Represents the data transfer object for resetting a user's password.
 */
export class ResetPasswordDto extends IntersectionType(
	ResetPasswordLinkDto,
	PasswordDto,
) {
	@ApiProperty()
	@IsString()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	oobCode?: string;
}

/**
 * Represents the data transfer object for updating a user's password.
 * Inherits properties from the ResetPasswordDto class.
 */
export class UpdatePasswordDto extends ResetPasswordDto {
	@ApiProperty()
	@IsString()
	@IsStrongPassword({
		minLength: 6,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	oldPassword: string;
}

/**
 * Represents the data transfer object for inviting a user.
 */
export class InviteUserDto extends PartialType(SendVerifyEmailDto) {
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	orgRoleId?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	organizationName?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsArray()
	propertiesToOwn?: PropertyInvitationDto[];

	@ApiPropertyOptional()
	@IsOptional()
	@IsArray()
	propertiesToManage?: PropertyInvitationDto[];
}

/**
 * Represents a property invitation data transfer object.
 */
export class PropertyInvitationDto {
	@ApiProperty()
	@IsString()
	uuid: string;

	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsString()
	name: string;
}

export class TenantSignUpDto extends PartialType(
	OmitType(UserSignUpDto, ['password']),
) {
	@IsString()
	@ApiPropertyOptional()
	@IsOptional()
	phoneNumber?: string;

	@IsString()
	@ApiPropertyOptional()
	@IsOptional()
	companyName?: string;

	@IsString()
	@ApiPropertyOptional()
	@IsOptional()
	title?: string;

	@IsObject()
	@IsOptional()
	leaseDetails?: OnboardingLeaseDto;

	@ApiPropertyOptional()
	@ApiHideProperty()
	@IsObject()
	@IsOptional()
	role?: RoleTypeDto;
}
