import { MapperPickType } from '@automapper/classes/mapped-types';

import { Permission } from '../../database/entities/permission.entity';

export class ViewPermissionDto extends MapperPickType(Permission, [
	'id',
	'name',
	'alias',
	'description',
]) {}
