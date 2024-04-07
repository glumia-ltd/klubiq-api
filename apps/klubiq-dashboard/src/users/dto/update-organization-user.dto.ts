import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationUserDto } from './create-organization-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationUserDto extends PartialType(
	CreateOrganizationUserDto,
) {}

export class UpdateUserProfileDto {
	@ApiPropertyOptional({ required: false })
	@IsOptional()
	@IsString()
	email?: string;

	@ApiPropertyOptional({ required: false })
	@IsOptional()
	@IsString()
	firstName?: string;
}
