import { startCase } from 'lodash';
import { DateTime } from 'luxon';

export enum UserRoles {
	SUPER_ADMIN = 'SuperAdmin',
	ADMIN = 'Admin',
	STAFF = 'Staff',
	LANDLORD = 'Landlord',
	TENANT = 'Tenant',
	ORG_OWNER = 'OrganizationOwner',
	PROPERTY_MANAGER = 'PropertyManager',
	PROPERTY_OWNER = 'PropertyOwner',
	LEASE_MANAGER = 'LeaseManager',
	CUSTOM = 'Custom',
}

export const SYSTEM_ROLES: UserRoles[] = [
	UserRoles.SUPER_ADMIN,
	UserRoles.ADMIN,
	UserRoles.STAFF,
	UserRoles.LANDLORD,
	UserRoles.TENANT,
];

export const ORG_ROLES: UserRoles[] = [
	UserRoles.ORG_OWNER,
	UserRoles.PROPERTY_MANAGER,
	UserRoles.PROPERTY_OWNER,
	UserRoles.LEASE_MANAGER,
	UserRoles.CUSTOM,
];

export enum Actions {
	VIEW = 'View',
	WRITE = 'Write',
}

export enum AppFeature {
	PROPERTY = 'Property',
	REPORT = 'Report',
	LEASE = 'Lease',
	TENANT = 'Tenant',
	USER = 'User',
	SETTING = 'Setting',
	MAINTENANCE = 'Maintenance',
	MESSAGING = 'Messaging',
	PUBLIC = 'Public',
	DASHBOARD = 'Dashboard',
}

//Enums to identify if it's a sign-up event or invite user event
export enum CreateUserEventTypes {
	CREATE_ORG_USER,
	INVITE_ORG_USER,
}

export enum CacheKeys {
	ORG_ROLES = 'org-roles',
	SYSTEM_ROLES = 'system-roles',
	ROLES_PERMISSIONS = 'roles-permission',
	PERMISSIONS = 'permissions',
	FEATURE_PERMISSIONS = 'feature-permissions',
	FEATURES = 'features',
	FEATURE_PERMISSIONS_BY_FEATURE = 'feature-permissions-by-feature',
	PROPERTY_CATEGORIES = 'property-categories',
	PROPERTY_TYPES = 'property-types',
	PROPERTY_STATUSES = 'property-status',
	PROPERTY_PURPOSES = 'property-purposes',
	PROPERTY_AMENITIES = 'property-amenities',
	PROPERTY_METRICS = 'property-metrics',
	TRANSACTION_METRICS = 'transaction-metrics',
	LEASE_METRICS = 'lease-metrics',
	REVENUE_METRICS = 'revenue-metrics',
	USER_PREFERENCES = 'user-preferences',
	ORGANIZATION_SETTINGS = 'organization-settings',
	SUBSCRIPTION_PLANS = 'subscription-plans',
	ORGANIZATION_SUBSCRIPTIONS = 'organization-subscriptions',
}

export enum TransactionType {
	REVENUE = 'Revenue',
	EXPENSE = 'Expense',
}

export enum RevenueType {
	PROPERTY_SALES = 'Property Sales',
	PROPERTY_RENTAL = 'Property Rental',
}

export enum ExpenseType {
	PROPERTY_TAX = 'Property Tax',
}

export enum PaymentFrequency {
	WEEKLY = 'Weekly',
	BI_WEEKLY = 'Bi-Weekly',
	MONTHLY = 'Monthly',
	ANNUALLY = 'Annually',
	ONE_TIME = 'One Time',
	BI_MONTHLY = 'Bi-Monthly',
	QUARTERLY = 'Quarterly',
	CUSTOM = 'Custom',
}

export enum MaintenanceStatus {
	NEW = 'New',
	IN_PROGRESS = 'In Progress',
	COMPLETED = 'Completed',
	ON_HOLD = 'On Hold',
}

export enum LeaseStatus {
	ACTIVE = 'Active',
	IN_ACTIVE = 'In Active',
	CANCELLED = 'Cancelled',
	EXPIRED = 'Expired',
	EXPIRING = 'Expiring',
	TERMINATED = 'Terminated',
}

export enum MaintenancePriority {
	LOW = 'Low',
	MEDIUM = 'Medium',
	HIGH = 'High',
	URGENT = 'Urgent',
}

export enum MaintenanceType {
	MAINTENANCE = 'Maintenance',
	SERVICE = 'Service',
	INSPECTION = 'Inspection',
	OTHER = 'Other',
}

export enum ADMIN_DOMAINS {
	KLUBIQ_COM = 'klubiq.com',
	GLUMIA_NG = 'glumia.ng',
	GLUMIA_COM = 'glumia.com',
}

export enum SortProperties {
	UPDATED_DATE = 'updatedDate',
	CREATED_DATE = 'createdDate',
	PROPERTY_NAME = 'name',
}

export enum UnitStatus {
	OCCUPIED = 'Occupied',
	VACANT = 'Vacant',
}
export enum DisplayOptions {
	ALL = 'all',
	ARCHIVED = 'archived',
}

export enum UnitType {
	SINGLE_UNIT = 'single-unit',
	MULTI_UNIT = 'multi-unit',
}

export type FilterData = {
	id: string;
	title: string;
	options: {
		label: string;
		value: string | number;
		order?: 'ASC' | 'DESC';
		Icon?: string;
	}[];
};
export const FILTER_OPTIONS: FilterData[] = [
	{
		id: 'display',
		title: 'Display',
		options: Object.values(DisplayOptions).map((option) => {
			return {
				label: startCase(option),
				value: option,
				Icon: '',
			};
		}),
	},
	{
		id: 'unitType',
		title: 'Unit Type',
		options: Object.values(UnitType).map((option) => {
			return {
				label: startCase(option),
				value: option,
				Icon: '',
			};
		}),
	},
	{
		id: 'sortBy',
		title: 'Sort Options',
		options: [
			{
				label: 'Recently Updated',
				value: SortProperties.UPDATED_DATE,
				order: 'DESC',
				Icon: 'TopBottom',
			},
			{
				value: SortProperties.CREATED_DATE,
				order: 'DESC',
				label: 'Newest',
				Icon: 'ReverseIcon',
			},
			{
				value: SortProperties.CREATED_DATE,
				order: 'ASC',
				label: 'Oldest',
				Icon: 'AscendIcon',
			},
			{
				value: SortProperties.PROPERTY_NAME,
				order: 'ASC',
				label: 'Property name (A -> Z)',
				Icon: 'AscendIcon',
			},
			{
				value: SortProperties.PROPERTY_NAME,
				order: 'DESC',
				label: 'Property name (Z -> A)',
				Icon: 'ReverseIcon',
			},
		],
	},
];

export const RENT_DUE_ON = (
	rentDueDay: number,
	startDate: string,
): Record<PaymentFrequency, string> => {
	const startDayAndMonth = DateTime.fromISO(startDate).toFormat('dd LLL');
	const day: string = DateTime.fromISO(startDate).weekdayLong;
	return {
		[PaymentFrequency.WEEKLY]: `${day} every week`,
		[PaymentFrequency.BI_WEEKLY]: `${day} Bi-Weekly`,
		[PaymentFrequency.MONTHLY]: `${rentDueDay} every month`,
		[PaymentFrequency.ANNUALLY]: `${startDayAndMonth} every year`,
		[PaymentFrequency.ONE_TIME]: `Once on ${startDayAndMonth}`,
		[PaymentFrequency.BI_MONTHLY]: `${rentDueDay} Bi-Monthly`,
		[PaymentFrequency.QUARTERLY]: `Quarterly on ${day}`,
		[PaymentFrequency.CUSTOM]: `See lease agreement`,
	};
};

export enum PaymentStatus {
	PENDING = 'Pending',
	PAID = 'Paid',
	UNPAID = 'Unpaid',
	OVERDUE = 'Overdue',
	PARTIAL = 'Partial',
}
