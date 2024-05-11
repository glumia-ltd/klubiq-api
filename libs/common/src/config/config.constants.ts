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
export enum FeaturePermissions {
	VIEW_PROPERTY = 'view_property_access',
	MANAGE_PROPERTY = 'all_property_access',
	VIEW_REPORT = 'view_report_access',
	MANAGE_REPORT = 'all_report_access',
	VIEW_LEASE = 'view_lease_access',
	MANAGE_LEASE = 'all_lease_access',
	VIEW_TENANT = 'view_tenant_access',
	MANAGE_TENANT = 'all_tenant_access',
	VIEW_USER = 'view_user_access',
	MANAGE_USER = 'all_user_access',
	VIEW_SETTING = 'view_setting_access',
	MANAGE_SETTING = 'all_setting_access',
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
}
