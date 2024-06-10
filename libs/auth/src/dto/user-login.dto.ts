import {
	ApiProperty,
	ApiPropertyOptional,
	IntersectionType,
	PartialType,
} from '@nestjs/swagger';
import {
	IsArray,
	IsEmail,
	IsNumber,
	IsOptional,
	IsPhoneNumber,
	IsString,
	IsStrongPassword,
	IsUrl,
} from 'class-validator';

export class userLoginDto {
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

export class UserSignUpDto extends PartialType(userLoginDto) {
	@ApiProperty({
		description: "User's first name",
		example: 'John',
	})
	@IsString()
	firstName: string;

	@ApiProperty({
		description: "User's last name",
		example: 'Doe',
	})
	@IsString()
	lastName: string;

	@ApiProperty({
		description: "User's password",
		example: '123456789',
	})
	@IsString()
	@IsStrongPassword({
		minLength: 6,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password: string;
}

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

export class OrgUserSignUpDto extends PartialType(UserSignUpDto) {
	@ApiProperty({
		description: 'Company name',
		example: 'Acme',
	})
	@IsString()
	companyName: string;
}

export class VerifyEmailDto {
	@ApiProperty({
		description: 'verification code',
	})
	@IsString()
	oobCode: string;
}

export class LookUpUserDto {
	@ApiProperty({
		description: 'User email',
	})
	@IsString()
	@IsEmail()
	email: string;
}

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

export class RefreshTokenExchangeDto {
	@ApiProperty({
		description: 'refresh token',
	})
	@IsString()
	refreshToken: string;
}

/* The ResetPasswordLinkDto class in TypeScript defines a data transfer object with an email property
that is annotated with validation decorators for string and email format. */
export class ResetPasswordLinkDto {
	@ApiProperty()
	@IsString()
	@IsEmail()
	email: string;
}
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
	oobCode: string;
}

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
	propertyIds?: string[];
}
