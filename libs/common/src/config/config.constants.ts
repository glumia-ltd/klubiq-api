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
	REVENUE_METRICS = 'revenue-metrics',
	USER_PREFERENCES = 'user-preferences',
	ORGANIZATION_SETTINGS = 'organization-settings',
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
	NEW = 'New',
	SIGNED = 'Signed',
	ACTIVE = 'Active',
	IN_ACTIVE = 'In Active',
	CANCELLED = 'Cancelled',
	EXPIRED = 'Expired',
	ON_HOLD = 'On Hold',
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
