import { startCase } from 'lodash';

export enum UserRoles {
	SUPER_ADMIN = 'Super_Admin',
	ADMIN = 'Admin',
	STAFF = 'Staff',
	LANDLORD = 'Landlord',
	TENANT = 'Tenant',
	ORG_OWNER = 'Organization_Owner',
	PROPERTY_MANAGER = 'Property_Manager',
	PROPERTY_OWNER = 'Property_Owner',
	LEASE_MANAGER = 'Lease_Manager',
	CUSTOM = 'Custom',
}

export enum UserType {
	LANDLORD = 'Landlord',
	TENANT = 'Tenant',
	KLUBIQ_STAFF = 'Klubiq_Staff',
}

export const SYSTEM_ROLES: UserRoles[] = [
	UserRoles.SUPER_ADMIN,
	UserRoles.ADMIN,
	UserRoles.STAFF,
	UserRoles.LANDLORD,
	UserRoles.TENANT,
];

export enum Priority {
	LOW = 'Low',
	MEDIUM = 'Medium',
	HIGH = 'High',
	URGENT = 'Urgent',
}

export const ORG_ROLES: UserRoles[] = [
	UserRoles.ORG_OWNER,
	UserRoles.PROPERTY_MANAGER,
	UserRoles.PROPERTY_OWNER,
	UserRoles.LEASE_MANAGER,
	UserRoles.CUSTOM,
];

export enum Permissions {
	READ = 'Read',
	CREATE = 'Create',
	UPDATE = 'Update',
	DELETE = 'Delete',
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
	ADMIN_PORTAL = 'Admin Portal',
	ORGANIZATION = 'Organization',
	SUBSCRIPTION = 'Subscription',
	TRANSACTION = 'Transaction',
	TENANT_PORTAL = 'Tenant Portal',
	WEBHOOK = 'Webhook',
	API = 'API',
	WALLET = 'Wallet',
}

//Enums to identify if it's a sign-up event or invite user event
export enum CreateUserEventTypes {
	CREATE_ORG_USER,
	INVITE_ORG_USER,
}
export enum OrganizationType {
	INDIVIDUAL = 'individual',
	COMPANY = 'company',
	NG_ORGANIZATION = 'ngo',
	GOVERNMENT = 'government',
	OTHER = 'other',
	SELF = 'self',
}

export enum CacheKeys {
	ORG_ROLES = 'klubiq-roles',
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
	ORGANIZATION_TENANTS = 'organization-tenants',
	ROLE_FEATURE_PERMISSIONS = 'role-feature-permissions',
	PROPERTY = 'properties',
	LEASE = 'leases',
	TRANSACTION = 'transactions',
	ORGANIZATION = 'organizations',
	USER = 'users',
	UNITS = 'units',
	TENANT = 'tenants',
	DASHBOARD = 'dashboard',
	PERMISSION = 'permission',
	AUTH = 'auth',
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
	ONE_TIME = 'One-Time',
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
	CANCELLED = 'Cancelled',
	EXPIRED = 'Expired',
	EXPIRING = 'Expiring',
	TERMINATED = 'Terminated',
	INACTIVE = 'Inactive',
}

export enum MaintenancePriority {
	LOW = Priority.LOW,
	MEDIUM = Priority.MEDIUM,
	HIGH = Priority.HIGH,
	URGENT = Priority.URGENT,
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
	startDayAndMonth: string,
	day: string,
): Record<PaymentFrequency, string> => {
	//const startDayAndMonth = DateTime.fromISO(startDate).toFormat('dd LLL');
	//day = DateTime.fromISO(startDate).weekdayLong;
	return {
		[PaymentFrequency.WEEKLY]: `${day} every week`,
		[PaymentFrequency.BI_WEEKLY]: `${day} Bi-Weekly`,
		[PaymentFrequency.MONTHLY]: `${rentDueDay}<sup>${getDaySuffix(rentDueDay)}</sup> of every month`,
		[PaymentFrequency.ANNUALLY]: `${startDayAndMonth} every year`,
		[PaymentFrequency.ONE_TIME]: `Once on ${startDayAndMonth}`,
		[PaymentFrequency.BI_MONTHLY]: `${rentDueDay}<sup>${getDaySuffix(rentDueDay)}</sup> of every other month`,
		[PaymentFrequency.QUARTERLY]: `Quarterly on ${day}`,
		[PaymentFrequency.CUSTOM]: `See lease agreement`,
	};
};

const getDaySuffix = (day: number) => {
	const j = day % 10;
	const k = day % 100;
	if (j === 1 && k !== 11) {
		return 'st';
	}
	if (j === 2 && k !== 12) {
		return 'nd';
	}
	if (j === 3 && k !== 13) {
		return 'rd';
	}
	return 'th';
};

export enum PaymentStatus {
	PENDING = 'Pending',
	PAID = 'Paid',
	UNPAID = 'Unpaid',
	OVERDUE = 'Overdue',
	PARTIAL = 'Partial',
	FAILED = 'Failed',
	CANCELLED = 'Cancelled',
	REFUNDED = 'Refunded',
	OTHER = 'Other',
}
export const CacheTTl = {
	FIVE_MINUTES: 5 * 60 * 1000,
	TEN_MINUTES: 10 * 60 * 1000,
	FIFTEEN_MINUTES: 15 * 60 * 1000,
	THIRTY_MINUTES: 30 * 60 * 1000,
	ONE_HOUR: 60 * 60 * 1000,
	ONE_DAY: 60 * 60 * 24 * 1000,
	ONE_WEEK: 60 * 60 * 24 * 7 * 1000,
	ONE_MONTH: 60 * 60 * 24 * 30 * 1000,
	ONE_YEAR: 60 * 60 * 24 * 365 * 1000,
};

export const LEASE_FILTER_OPTIONS: FilterData[] = [
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
		id: 'status',
		title: 'Status',
		options: Object.values(LeaseStatus).map((option) => {
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
		],
	},
];

export enum NotificationPriority {
	LOW = Priority.LOW,
	MEDIUM = Priority.MEDIUM,
	HIGH = Priority.HIGH,
	URGENT = Priority.URGENT,
}
export enum NotificationPeriod {
	Today = 'Today',
	Yesterday = 'Yesterday',
	Last7Days = 'Last 7 days',
	Last30Days = 'Last 30 days',
	Older = 'Older',
}

export const ROLE_ALIAS = (
	customRoleName?: string,
): Record<UserRoles, string> => {
	return {
		[UserRoles.ADMIN]: 'Admin',
		[UserRoles.SUPER_ADMIN]: 'Executive Admin',
		[UserRoles.STAFF]: 'Staff',
		[UserRoles.LANDLORD]: 'Landlord',
		[UserRoles.TENANT]: 'Tenant',
		[UserRoles.ORG_OWNER]: 'Executive Manager',
		[UserRoles.PROPERTY_MANAGER]: 'Property Manager',
		[UserRoles.PROPERTY_OWNER]: 'Property Owner',
		[UserRoles.LEASE_MANAGER]: 'Lease Manager',
		[UserRoles.CUSTOM]: `${customRoleName || 'Member'}`,
	};
};
