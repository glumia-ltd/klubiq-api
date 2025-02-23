import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class ViewOrgRoleDto {
	@AutoMap()
	@ApiProperty()
	name: string;

	@AutoMap()
	permissions: string[];
}

export class OrgRoleResponseDto {
	@AutoMap()
	@ApiProperty()
	id: number;

	@AutoMap()
	@ApiProperty()
	name: string;

	@AutoMap()
	@ApiProperty()
	description?: string;

	@AutoMap()
	@Exclude()
	isKlubiqInternal?: boolean;
}
