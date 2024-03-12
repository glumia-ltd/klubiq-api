import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationUserDto } from './create-organization-user.dto';

export class UpdateOrganizationUserDto extends PartialType(
	CreateOrganizationUserDto,
) {}
