import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';
import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
	@AutoMap()
	@ApiProperty()
	@IsString()
	ownerId?: string;
}
