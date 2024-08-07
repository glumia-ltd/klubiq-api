import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsDateString,
	IsEmail,
	IsOptional,
	IsPhoneNumber,
	IsString,
} from 'class-validator';

export class CreateTenantDto {
	@AutoMap()
	@ApiProperty()
	@IsOptional()
	@IsString()
	companyName?: string;

	@AutoMap()
	@ApiProperty()
	@IsOptional()
	@IsDateString()
	dateOfBirth?: string;

	@AutoMap()
	@ApiProperty()
	@IsEmail()
	@IsString()
	email: string;

	@AutoMap()
	@ApiProperty()
	@IsOptional()
	@IsString()
	firstName?: string;

	@AutoMap()
	@ApiProperty()
	@IsPhoneNumber()
	@IsString()
	lastName?: string;

	@AutoMap()
	@ApiProperty()
	@IsOptional()
	@IsString()
	notes?: string;

	@AutoMap()
	@ApiProperty()
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@AutoMap()
	@ApiProperty()
	@IsOptional()
	@IsString()
	title?: string;
}
