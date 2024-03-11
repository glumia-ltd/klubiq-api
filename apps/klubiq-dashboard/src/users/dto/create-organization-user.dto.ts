import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationUserDto {
	@ApiProperty({
		description: "User's first name",
		example: 'John',
	})
	firstName: string;

	@ApiProperty({
		description: "User's last name",
		example: 'Doe',
	})
	lastName: string;

	@ApiProperty({
		description: "User's email",
		example: 'john.doe@test.com',
	})
	email: string;
}
