import { AutoMap } from '@automapper/classes';
import {
	IsDateString,
	IsEmail,
	IsOptional,
	IsPhoneNumber,
	IsString,
} from 'class-validator';

export class CreateTenantDto {
	@AutoMap()
	@IsOptional()
	@IsString()
	companyName?: string;

	@AutoMap()
	@IsOptional()
	@IsDateString()
	dateOfBirth?: string;

	@AutoMap()
	@IsEmail()
	@IsString()
	email: string;

	@AutoMap()
	@IsOptional()
	@IsString()
	firstName?: string;

	@AutoMap()
	@IsPhoneNumber()
	@IsString()
	lastName?: string;

	@AutoMap()
	@IsOptional()
	@IsString()
	notes?: string;

	@AutoMap()
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@AutoMap()
	@IsOptional()
	@IsString()
	title?: string;
}
