import { PropertyEvent } from './property-event';

export enum EVENTS {
	PROPERTY_CREATED = 'property.created',
	PROPERTY_UPDATED = 'property.updated',
	PROPERTY_DELETED = 'property.deleted',
	PROPERTY_ARCHIVED = 'property.archived',
	PROPERTY_ASSIGNED = 'property.assigned',
}
export type EventTemplate = {
	subject: string;
	message: string;
	type: string;
};
export const EVENT_TEMPLATE = (
	payload: PropertyEvent,
): Record<EVENTS, EventTemplate> => {
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
	};
};
