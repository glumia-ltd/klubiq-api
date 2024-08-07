import { TenantUser } from '@app/common/database/entities/tenant.entity';
import { MapperOmitType } from '@automapper/classes/mapped-types';

export class TenantDto extends MapperOmitType(TenantUser, [
	'updatedDate',
	'createdDate',
]) {}
