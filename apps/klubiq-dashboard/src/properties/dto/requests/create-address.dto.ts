import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateAddressDto {
	@AutoMap()
	@IsString()
	addressLine1: string;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	addressLine2?: string;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	unit?: string;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	city?: string;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	state?: string;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	postalCode?: string;

	@AutoMap()
	@IsString()
	country: string;

	@AutoMap()
	@IsBoolean()
	isManualAddress: boolean;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	latitude?: number;

	@AutoMap()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	longitude?: number;
}
