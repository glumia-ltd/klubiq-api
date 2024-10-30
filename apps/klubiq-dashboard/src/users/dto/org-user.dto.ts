import { IsString } from 'class-validator';

export class UserDetailsDto {
	@IsString()
	userId: string;

	@IsString()
	email: string;

	@IsString()
	firstName: string;

	@IsString()
	lastName: string;
}
