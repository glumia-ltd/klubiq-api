import { Lease } from '@app/common/database/entities/lease.entity';
import { MapperOmitType } from '@automapper/classes/mapped-types';
import { AutoMap } from '@automapper/classes';
import { TenantDto } from '@app/common/dto/responses/tenant.dto';

export class LeaseDto extends MapperOmitType(Lease, [
	'createdDate',
	'updatedDate',
	'deletedAt',
	'tenants',
	'property',
	'transactions',
]) {
	@AutoMap()
	startDate: Date;

	@AutoMap()
	endDate: Date;

	@AutoMap(() => [TenantDto])
	tenants: TenantDto[];

	@AutoMap()
	propertyUuid: string;
}
