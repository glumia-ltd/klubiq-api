import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateUserDto {
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
	email: string;

	@ApiProperty({
		description: "User's email",
		example: 'john.doe@test.com',
	})
	@IsString()
	password: string;
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
