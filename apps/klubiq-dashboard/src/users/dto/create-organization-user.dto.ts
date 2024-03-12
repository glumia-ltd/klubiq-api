import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsNumber, IsObject, IsString, IsStrongPassword } from 'class-validator';

export class CreateOrganizationUserDto {
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
		description: "User's email",
		example: 'john.doe@test.com',
	})
	@IsString()
	@IsEmail()
	email: string;

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

	@ApiProperty({
		description: "Company name",
		example: 'Acme',
	})
	@IsString()
	companyName: string;

	@ApiProperty({
		description: "User system roles",
		example: ['admin','user'],
	})
	@IsArray()
	roles: string[]
}

export class UserSignUpResponseDataDto {
	@ApiProperty()
	@IsString()
	id: string;

	@ApiProperty()
	@IsString()
	firstName: string;

	@ApiProperty()
	@IsString()
	lastName: string;

	@ApiProperty()
	@IsString()
	email: string;

	@ApiProperty()
	@IsString()
	role: string;

	@ApiProperty()
	@IsBoolean()
	isDeleted: boolean;

	@ApiProperty()
	@IsBoolean()
	active: boolean;

	@ApiProperty()
	@IsString()
	_id: string;

	@ApiProperty()
	@IsString()
	createdAt: Date;

	@ApiProperty()
	@IsString()
	updatedAt: Date;

	@ApiProperty()
	@IsNumber()
	__v: number;
  }

  class UserResultWithToken {
	@ApiProperty()
	@IsObject()
	newUser: UserSignUpResponseDataDto;

	@ApiProperty()
	@IsString()
	token: string;
  }

  export class UserSignUpResponseDto {
	@ApiProperty()
	@IsBoolean()
	error: boolean;

	@ApiProperty()
	@IsNumber()
	errorCode: number;

	@ApiProperty()
	@IsString()
	message: string;

	@ApiProperty()
	@IsObject()
	data: UserResultWithToken;
  }
