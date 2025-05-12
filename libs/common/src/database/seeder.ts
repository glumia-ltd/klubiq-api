// src/seeders/main.seeder.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationRole } from './entities/organization-role.entity';
import { Feature } from './entities/feature.entity';
import { Permission } from './entities/permission.entity';
import { AppFeature, UserRoles, Permissions } from '../config/config.constants';

@Injectable()
export class MainSeeder {
	private readonly logger = new Logger(MainSeeder.name);

	constructor(
		@InjectRepository(OrganizationRole)
		private readonly roleRepository: Repository<OrganizationRole>,
		@InjectRepository(Feature)
		private readonly featureRepository: Repository<Feature>,
		@InjectRepository(Permission)
		private readonly permissionRepository: Repository<Permission>,
	) {}

	async run(): Promise<void> {
		try {
			// Check if data already exists to avoid duplicates.  This is crucial!
			const roleCount = await this.roleRepository.count();
			if (roleCount > 0) {
				this.logger.log('Database already seeded. Skipping.');
				return;
			}

			// Create initial roles, features, and permissions.
			const roles = [
				{
					name: UserRoles.SUPER_ADMIN,
					alias: 'Super Admin',
					description: 'Has full access to all system features and settings.',
					isKlubiqInternal: true,
				},
				{
					name: UserRoles.ADMIN,
					alias: 'Admin',
					description: 'Has access to most system features and settings.',
					isKlubiqInternal: true,
				},
				{
					name: UserRoles.STAFF,
					alias: 'Staff',
					description:
						'Has access to specific features and settings as assigned.',
					isKlubiqInternal: false,
				},
				{
					name: UserRoles.LANDLORD,
					alias: 'Landlord',
					description: 'Not Used',
					isKlubiqInternal: false,
				},
				{
					name: UserRoles.TENANT,
					alias: 'Tenant',
					description: 'Rents properties and interacts with landlords.',
					isKlubiqInternal: false,
				},
				{
					name: UserRoles.ORG_OWNER,
					alias: 'Organization Owner',
					description: 'Owns and manages the organization.',
					isKlubiqInternal: false,
				},
				{
					name: UserRoles.PROPERTY_MANAGER,
					alias: 'Property Manager',
					description: 'Manages properties on behalf of the owner.',
					isKlubiqInternal: false,
				},
				{
					name: UserRoles.PROPERTY_OWNER,
					alias: 'Property Owner',
					description:
						'Owns properties and manages them directly or through a manager.',
					isKlubiqInternal: false,
				},
				{
					name: UserRoles.LEASE_MANAGER,
					alias: 'Lease Manager',
					description: 'Manages leases and tenant agreements.',
					isKlubiqInternal: false,
				},
			];

			const features = [
				{
					name: AppFeature.PROPERTY,
					alias: 'Property Management',
					description: 'Manage properties and related information.',
				},
				{
					name: AppFeature.REPORT,
					alias: 'Reporting',
					description: 'Generate and view reports.',
				},
				{
					name: AppFeature.LEASE,
					alias: 'Lease Management',
					description: 'Manage leases and tenant agreements.',
				},
				{
					name: AppFeature.TENANT,
					alias: 'Tenant Management',
					description: 'Manage tenant information and interactions.',
				},
				{
					name: AppFeature.USER,
					alias: 'User Management',
					description: 'Manage user accounts and permissions.',
				},
				{
					name: AppFeature.SETTING,
					alias: 'Settings',
					description: 'Configure system settings and preferences.',
				},
				{
					name: AppFeature.MAINTENANCE,
					alias: 'Maintenance',
					description: 'Manage maintenance requests and schedules.',
				},
				{
					name: AppFeature.MESSAGING,
					alias: 'Messaging',
					description: 'Send and receive messages within the system.',
				},
				{
					name: AppFeature.PUBLIC,
					alias: 'Public Access',
					description: 'Features accessible to the public.',
				},
				{
					name: AppFeature.DASHBOARD,
					alias: 'Dashboard',
					description: 'View system dashboards and summaries.',
				},
				{
					name: AppFeature.ADMIN_PORTAL,
					alias: 'Admin Portal',
					description: 'Access administrative features and settings.',
				},
				{
					name: AppFeature.ORGANIZATION,
					alias: 'Organization Management',
					description: 'Manage organization details and settings.',
				},
				{
					name: AppFeature.SUBSCRIPTION,
					alias: 'Subscription Management',
					description: 'Manage subscription plans and billing.',
				},
				{
					name: AppFeature.TRANSACTION,
					alias: 'Transaction Management',
					description: 'Manage financial transactions and records.',
				},
				{
					name: AppFeature.TENANT_PORTAL,
					alias: 'Tenant Portal',
					description: 'Access features available to tenants.',
				},
				{
					name: AppFeature.WEBHOOK,
					alias: 'Webhook Management',
					description: 'Manage webhooks and integrations.',
				},
				{
					name: AppFeature.API,
					alias: 'API Access',
					description: 'Access system APIs and documentation.',
				},
				{
					name: AppFeature.WALLET,
					alias: 'Wallet Management',
					description: 'Manage digital wallets and transactions.',
				},
			];

			const permissions = [
				{
					name: Permissions.READ,
					alias: 'Read Permission',
					description: 'Allows reading of data.',
				},
				{
					name: Permissions.CREATE,
					alias: 'Create Permission',
					description: 'Allows creation of new data.',
				},
				{
					name: Permissions.UPDATE,
					alias: 'Update Permission',
					description: 'Allows updating of existing data.',
				},
				{
					name: Permissions.DELETE,
					alias: 'Delete Permission',
					description: 'Allows deletion of data.',
				},
			];

			// Save the data to the database.
			for (const roleData of roles) {
				const role = this.roleRepository.create(roleData);
				await this.roleRepository.save(role);
			}

			for (const featureData of features) {
				const feature = this.featureRepository.create(featureData);
				await this.featureRepository.save(feature);
			}

			for (const permissionData of permissions) {
				const permission = this.permissionRepository.create(permissionData);
				await this.permissionRepository.save(permission);
			}

			this.logger.log('Successfully seeded roles, features, and permissions.');
		} catch (error) {
			this.logger.error('Failed to seed database:', error.stack);
			throw error; // Re-throw for handling in AppModule.
		}
	}
}
