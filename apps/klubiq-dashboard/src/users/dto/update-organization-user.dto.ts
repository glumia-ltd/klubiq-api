import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationUserDto } from './create-organization-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

class UpdateOrganizationUserDto extends PartialType(
	CreateOrganizationUserDto,
) {}

class UpdateUserProfileDto {
	@ApiPropertyOptional({ required: false })
	@IsOptional()
	@IsString()
	firstName?: string;
}

export class UpdateUserDto {
	@ApiPropertyOptional({ required: false })
	@IsObject()
	@IsOptional()
	profile?: UpdateUserProfileDto;

	@ApiPropertyOptional({ required: false })
	@IsObject()
	@IsOptional()
	organizationUser?: UpdateOrganizationUserDto;

	constructor(partial: Partial<UpdateUserDto>) {
		Object.assign(this, partial);
	}
}
