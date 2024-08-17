import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsJSON, IsNumber, IsOptional } from 'class-validator';

export class CreateUserPreferencesDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	id?: number;

	@IsOptional()
	@IsJSON()
	preferences: Record<string, any>;
}
