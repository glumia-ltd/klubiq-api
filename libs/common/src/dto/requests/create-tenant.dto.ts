import { AutoMap } from '@automapper/classes';
import {
	ApiHideProperty,
	ApiProperty,
	ApiPropertyOptional,
} from '@nestjs/swagger';
import {
	IsDateString,
	IsEmail,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreateTenantDto {
	@IsOptional()
	@IsNumber()
	id?: number;

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
	@IsOptional()
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

	@ApiPropertyOptional()
	@ApiHideProperty()
	@IsObject()
	@IsOptional()
	role?: {
		name: string;
		id: number;
	};
}
