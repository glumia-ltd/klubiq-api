import { PropertyEvent } from './event-models';

export enum EVENTS {
	PROPERTY_CREATED = 'property.created',
	PROPERTY_UPDATED = 'property.updated',
	PROPERTY_DELETED = 'property.deleted',
	PROPERTY_ARCHIVED = 'property.archived',
	PROPERTY_ASSIGNED = 'property.assigned',
	LEASE_CREATED = 'lease.created',
	TENANT_CREATED = 'tenant.created',
	TENANT_ONBOARDED = 'tenant.onboarded',
}
export type EventTemplate = {
	subject: string;
	message: string;
	type: string;
};
export const EVENT_TEMPLATE = (
	payload: PropertyEvent,
): Record<EVENTS, EventTemplate | null> => {
	return {
		[EVENTS.PROPERTY_CREATED]: {
			subject: 'New Property Created',
			message: `A new property has been created by ${payload.propertyManagerName} in your organization.`,
			type: 'property-created',
		},
		[EVENTS.PROPERTY_UPDATED]: {
			subject: 'Property Updated',
			message: `A property has been updated by ${payload.propertyManagerName} in your organization.`,
			type: 'property-updated',
		},
		[EVENTS.PROPERTY_DELETED]: {
			subject: 'Property Deleted',
			message: `A property has been deleted by ${payload.propertyManagerName} in your organization.`,
			type: 'property-deleted',
		},
		[EVENTS.PROPERTY_ARCHIVED]: {
			subject: 'Property Archived',
			message: `A property has been archived by ${payload.propertyManagerName} in your organization.`,
			type: 'property-archived',
		},
		[EVENTS.PROPERTY_ASSIGNED]: {
			subject: 'Property Assigned',
			message: `A property has been assigned to you by ${payload.propertyManagerName} in your organization.`,
			type: 'property-assigned',
		},
		[EVENTS.LEASE_CREATED]: {
			subject: 'New Lease Created',
			message: `A new lease has been created by ${payload.propertyManagerName} in your organization.`,
			type: 'lease-created',
		},
		[EVENTS.TENANT_CREATED]: {
			subject: 'New Tenant Created',
			message: `A new tenant has been created by ${payload.propertyManagerName} in your organization.`,
			type: 'tenant-created',
		},
		[EVENTS.TENANT_ONBOARDED]: {
			subject: 'Tenant Onboarded',
			message: `A new tenant has been onboarded by ${payload.propertyManagerName} in your organization.`,
			type: 'tenant-onboarded',
		},
	};
};
