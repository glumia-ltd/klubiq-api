import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { FeaturePermission } from '../database/entities/feature-permission.entity';

export class OrgRoleDto {
	@AutoMap()
	@ApiProperty()
	id: string;

	@AutoMap()
	@ApiProperty()
	name: string;

	@AutoMap()
	@ApiProperty()
	description?: string;

	@AutoMap()
	@ApiProperty()
	featurePermissions: FeaturePermission[];
}
