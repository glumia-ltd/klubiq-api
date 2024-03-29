import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Feature } from '../database/entities/feature.entity';
import { Permission } from '../database/entities/permission.entity';

export class OrgRoleDto {
	@AutoMap()
	@ApiProperty()
	description?: string;

	@AutoMap()
	@ApiProperty()
	featureId!: number;

	@AutoMap()
	@ApiProperty()
	alias?: string;

	@AutoMap(() => Permission)
	permission?: Permission;

	@AutoMap(() => Feature)
	feature?: Feature;
}
