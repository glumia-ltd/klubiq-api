import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class TenantDto {
	@Expose()
	@IsNumber()
	id?: number;

	@Expose()
	@IsString()
	title?: string;

	@Expose()
	@IsString()
	email: string;

	@Expose()
	@IsString()
	firstName?: string;

	@Expose()
	@IsString()
	lastName?: string;

	@Expose()
	@IsString()
	companyName?: string;

	@Expose()
	@IsString()
	notes?: string;

	@Expose()
	@IsDate()
	dateOfBirth?: Date;
}
