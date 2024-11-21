import { TenantDto } from '@app/common/dto/responses/tenant.dto';

export class PropertyEvent {
	organizationId: string;
	name?: string;
	totalUnits?: number;
	propertyManagerId?: string;
	propertyManagerEmail?: string;
	propertyId?: string;
	propertyManagerName?: string;
	propertyAddress?: string;
	eventTimestamp?: string;
	assignedToName?: string;
	assignedToEmail?: string;
	assignedToId?: string;
}

export class LeaseEvent extends PropertyEvent {
	tenants: TenantDto[];
	startDate?: string;
	endDate?: string;
	leaseId?: string;
	paymentFrequency?: string;
	rent?: number;
	unitNumber?: string;
	leaseName?: string;
	firstPaymentDate?: string;
}
