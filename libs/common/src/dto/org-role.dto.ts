import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class ViewOrgRoleDto {
	@AutoMap()
	@ApiProperty()
	name: string;

	@AutoMap()
	permissions: string[];
}
