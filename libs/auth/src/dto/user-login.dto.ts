import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

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
