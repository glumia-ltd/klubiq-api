import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateAddressDto {
	@IsString()
	addressLine1: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	addressLine2?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	unit?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	state?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	postalCode?: string;

	@IsString()
	country: string;

	@IsBoolean()
	isManualAddress: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	latitude?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	longitude?: number;
}
