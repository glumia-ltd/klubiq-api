import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, IsUrl } from 'class-validator';
import { AutoMap } from '@automapper/classes';
export class CreateOrganizationDto {
	@AutoMap()
	@ApiProperty({
		description: "Company's name",
		example: 'Acme LLC',
	})
	@IsString()
	name: string;

	@AutoMap()
	@ApiProperty({
		description: "Company's email",
		example: 'info@acme.com',
	})
	@IsString()
	@IsEmail()
	email: string;

	@AutoMap()
	@ApiProperty({
		description: 'Is company verified',
		example: 'info@acme.com',
	})
	@IsBoolean()
	isVerified?: boolean;

	@AutoMap()
	@ApiProperty({
		description: "Company's Government Registration Number",
		example: '111844d4ww',
	})
	@IsString()
	govRegistrationNumber?: string;

	@AutoMap()
	@ApiProperty({
		description: 'Country Phone code',
		example: '+234',
	})
	@IsString()
	countryPhoneCode?: string;

	@AutoMap()
	@ApiProperty({
		description: "Company's phone number",
		example: '1234567890',
	})
	@IsString()
	phoneNumber?: string;

	@AutoMap()
	@ApiProperty({
		description: "Company's address street",
		example: '234 Main st',
	})
	@IsString()
	street?: string;

	@AutoMap()
	@ApiProperty({
		description: "Company's address street 2",
		example: 'Suite 500',
	})
	@IsString()
	addressLine2?: string;

	@AutoMap()
	@ApiProperty({
		description: "Company's address state",
		example: 'Lagos',
	})
	@IsString()
	state?: string;

	@AutoMap()
	@ApiProperty({
		description: "Company's address city",
		example: 'Lagos',
	})
	@IsString()
	city?: string;

	@AutoMap()
	@ApiProperty({
		description: "Company's address country",
		example: 'Nigeria',
	})
	@IsString()
	country?: string;

	@AutoMap()
	@ApiProperty({
		description: "Company's address postal code",
		example: '0123456',
	})
	@IsString()
	postalCode?: string;

	@AutoMap()
	@ApiProperty({
		description: 'Company type',
		example: 'Agent, Developer',
	})
	@IsString()
	companyType?: string;

	@AutoMap()
	@ApiProperty({
		description: "Company's website",
		example: 'www.acme.com',
	})
	@IsUrl()
	website?: string;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isRentDueEmailNotificationEnabled?: boolean;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isMaintenanceRequestNotificationEnabled?: boolean;
}
