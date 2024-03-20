import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class userLoginDto {
	@ApiProperty()
	@IsString()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsString()
	password: string;
}
