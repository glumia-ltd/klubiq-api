import { ADMIN_DOMAINS } from '@app/common/config/config.constants';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsStrongPassword } from 'class-validator';

export class CreateSuperAdminDTO {
	@ApiPropertyOptional({
		enum: ADMIN_DOMAINS,
		default: ADMIN_DOMAINS.GLUMIA_NG,
	})
	@IsEnum(ADMIN_DOMAINS)
	readonly domain?: ADMIN_DOMAINS = ADMIN_DOMAINS.GLUMIA_NG;

	@IsString()
	@IsStrongPassword({
		minLength: 6,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password: string;

	@IsString()
	username: string;
}
