// import { Organization } from './entity/organization.entity';
import "reflect-metadata"
import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
// import { OrganizationRole } from './entity/organization-role.entity';
// import { OrganizationUser } from './entity/organization-user.entity';
// import { Feature } from './entity/feature.entity';
// import { FeaturePermission } from './entity/feature-permission.entity';
// import { Permission } from './entity/permission.entity';
import { UserProfile } from '@app/common/src/database/entities/user-profile.entity';
// import { UserProfile } from './entity/user-profile.entity';
// import { PropertyAddress } from './entity/property-address.entity';
// import { Property } from './entity/property.entity';
// import { PropertyCategory } from './entity/property-category.entity';
// import { PropertyPurpose } from './entity/property-purpose.entity';
// import { PropertyStatus } from './entity/property-status.entity';
// import { PropertyType } from './entity/property-type.entity';
// import { Amenity } from './entity/property-amenity.entity';
// import { PropertyImage } from './entity/property-image.entity';
// import { Transaction } from './entity/transaction.entity';
// import { Lease } from './entity/lease.entity';
// import { Maintenance } from './entity/maintenance.entity';
// import { UserInvitation } from './entity/user-invitation.entity';
// import { TenantUser } from './entity/tenant.entity';
import { TenantUser } from '@app/common/src/database/entities/tenant.entity';
import { Organization } from "@app/common/src/database/entities/organization.entity";
import { OrganizationRole } from "@app/common/src/database/entities/organization-role.entity";
import { OrganizationUser } from "@app/common/src/database/entities/organization-user.entity";
import { Feature } from "@app/common/src/database/entities/feature.entity";
import { FeaturePermission } from "@app/common/src/database/entities/feature-permission.entity";
import { Permission } from "@app/common/src/database/entities/permission.entity";
import { PropertyAddress } from "@app/common/src/database/entities/property-address.entity";
import { RoleFeaturePermissions } from "@app/common/src/database/entities/role-feature-permission.entity";
import { UserPreferences } from "@app/common/src/database/entities/user-preferences.entity";
import { Unit } from "@app/common/src/database/entities/unit.entity";
import { PropertyPurpose } from "./entity/property-purpose.entity";
import { OrganizationTenants } from "@app/common/src/database/entities/organization-tenants.entity";
import { NotificationSubscription } from "@app/common/src/database/entities/notification-subscription.entity";
import { Property } from "@app/common/src/database/entities/property.entity";
import { PropertyCategory } from "@app/common/src/database/entities/property-category.entity";
import { PropertyStatus } from "@app/common/src/database/entities/property-status.entity";
import { PropertyType } from "@app/common/src/database/entities/property-type.entity";
import { Amenity } from "@app/common/src/database/entities/property-amenity.entity";
import { PropertyImage } from "@app/common/src/database/entities/property-image.entity";
import { Lease } from "@app/common/src/database/entities/lease.entity";
import { Maintenance } from "@app/common/src/database/entities/maintenance.entity";
import { Transaction } from "@app/common/src/database/entities/transaction.entity";
import { UserInvitation } from "@app/common/src/database/entities/user-invitation.entity";
import { OrganizationSettings } from "@app/common/src/database/entities/organization-settings.entity";
import { OrganizationSubscriptions } from "@app/common/src/database/entities/organization-subscriptions.entity";
import { OrganizationCounter } from "@app/common/src/database/entities/organization-counter.entity";
import { SubscriptionPlan } from "@app/common/src/database/entities/subscription-plan.entity";
import { Notifications } from "@app/common/src/database/entities/notifications.entity";
import { DeletedFilesRecords } from "@app/common/src/database/entities/deleted-files.entity";

// import { UserPreferences } from './entity/user-preferences.entity';
// import { OrganizationSettings } from './entity/organization-settings.entity';
// import { Unit } from './entity/unit.entity';
// import { OrganizationSubscriptions } from './entity/organization-subscriptions.entity';
// import { OrganizationCounter } from './entity/organization-counter.entity';
// import { SubscriptionPlan } from './entity/subscription-plan.entity';
// import { NotificationSubscription } from './entity/notification-subscription.entity';
// import { Notifications } from './entity/notifications.entity';
// import { OrganizationTenants } from './entity/organization-tenants.entity';
// import { DeletedFilesRecords } from './entity/deleted-files.entity';
// import { RoleFeaturePermissions } from './entity/role-feature-permission.entity';

dotenv.config()

// Database connection
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: false,
    ssl: {
        rejectUnauthorized: false,
    },
    logging: false,
    entities: [Organization,
        OrganizationRole,
        OrganizationUser,
        Feature,
        FeaturePermission,
        Permission,
        UserProfile,
        PropertyAddress,
        Property,
        PropertyCategory,
        PropertyPurpose,
        PropertyStatus,
        PropertyType,
        Amenity,
        PropertyImage,
        Lease,
        Maintenance,
        Transaction,
        UserInvitation,
        TenantUser,
        UserPreferences,
        OrganizationSettings,
        Unit,
        OrganizationSubscriptions,
        OrganizationCounter,
        SubscriptionPlan,
        NotificationSubscription,
        Notifications,
        OrganizationTenants,
        DeletedFilesRecords,
        RoleFeaturePermissions,
    ],
    migrations: ['build/migrations/*-changes.js'],
    subscribers: [],
})
