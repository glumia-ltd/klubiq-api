import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantProfileDto {
	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'First name of the tenant' })
	firstName?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'Last name of the tenant' })
	lastName?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'Phone number of the tenant' })
	phoneNumber?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'Title of the tenant (e.g., Mr, Mrs)' })
	title?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'Profile picture URL of the tenant' })
	profilePicUrl?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'Street address of the tenant' })
	street?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		description: 'Additional address line (addressLine2)',
	})
	addressLine2?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'City of the tenant' })
	city?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'State or region of the tenant' })
	state?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'Postal or ZIP code of the tenant' })
	postalCode?: string;

	@Expose()
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'Country of the tenant' })
	country?: string;
}
