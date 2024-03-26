import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsNumber,
	IsString,
	IsStrongPassword,
} from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class CreateOrganizationUserDto {
	@AutoMap()
	@ApiProperty({
		description: "User's first name",
		example: 'John',
	})
	@IsString()
	firstName: string;

	@AutoMap()
	@ApiProperty({
		description: "User's last name",
		example: 'Doe',
	})
	@IsString()
	lastName: string;

	@AutoMap()
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
		description: 'Company name',
		example: 'Acme',
	})
	@IsString()
	companyName: string;
}

export class UserResponseDto {
	@AutoMap()
	@ApiProperty()
	@IsNumber()
	profileId: number;

	@AutoMap()
	@ApiProperty()
	@IsString()
	profileUuid: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	firstName: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	lastName: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	email: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	systemRole: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	orgRole: string;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isDeleted: boolean;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isActive: boolean;

	@AutoMap()
	@ApiProperty()
	@IsString()
	profilePicUrl: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	phoneNumber: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	countryPhoneCode: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	street: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	addressLine2: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	state: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	city: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	country: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	postalCode: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	formOfIdentity: string;

	@AutoMap()
	@ApiProperty()
	@IsDate()
	dateOfBirth: Date;

	@AutoMap()
	@ApiProperty()
	@IsString()
	gender: string;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isAccountVerified: boolean;

	@AutoMap()
	@ApiProperty()
	@IsString()
	bio: string;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isTermsAndConditionAccepted?: boolean;

	@AutoMap()
	@ApiProperty()
	@IsBoolean()
	isPrivacyPolicyAgreed?: boolean;

	@AutoMap()
	@ApiProperty()
	@IsString()
	_id: string;

	@AutoMap()
	@ApiProperty()
	@IsString()
	userUuid: string;

	@AutoMap()
	@ApiProperty()
	@IsNumber()
	userId: number;

	@AutoMap()
	@ApiProperty()
	@IsNumber()
	organizationId: number;

	@AutoMap()
	@ApiProperty()
	@IsString()
	organizationName: string;
}
