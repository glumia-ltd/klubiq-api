import { TenantDto } from '@app/common/dto/responses/tenant.dto';
import { IntersectionType } from '@nestjs/swagger';

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
	actionLink?: string;
	actionText?: string;
	currency?: string;
	locale?: string;
	language?: string;
	invalidateCache?: boolean = true;
}

export class LeaseEvent extends PropertyEvent {
	tenants: TenantDto[];
	startDate?: string;
	endDate?: string;
	leaseId?: string;
	paymentFrequency?: string;
	rent?: number | string;
	unitNumber?: string;
	leaseName?: string;
	firstPaymentDate?: string;
	propertyName?: string;
	sendNotification: boolean = true;
}

export class TenantEvent extends IntersectionType(LeaseEvent, TenantDto) {
	tenantId?: string;
	tenantName?: string;
	tenantEmail?: string;
	tenantPhone?: string;
}
