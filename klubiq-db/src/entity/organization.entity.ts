import {
	Entity,
	PrimaryGeneratedColumn,
	DeleteDateColumn,
	Column,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
	OneToOne,
} from 'typeorm';
import { OrganizationUser } from './organization-user.entity';
import { Property } from './property.entity';

import { OrganizationTenants } from './organization-tenants.entity';
import { OrganizationRole } from './organization-role.entity';
import { Transaction } from './transaction.entity';
import { OrganizationSettings } from './organization-settings.entity';
import { OrganizationSubscriptions } from './organization-subscriptions.entity';
import { PropertyImage } from './property-image.entity';

@Entity({ schema: 'poo' })
export class Organization {
	
	@PrimaryGeneratedColumn('uuid')
	organizationUuid?: string;

	
	@Column({ default: true })
	isActive?: boolean;

	
	@Index()
	@Column({ length: 100, unique: true, nullable: true })
	name: string;

	
	@Column({ default: false })
	isVerified?: boolean;

	
	@Column({ default: false })
	isKYBVerified?: boolean;

	
	@Column({ nullable: true })
	email?: string;

	
	@Column({ nullable: true })
	govRegistrationNumber?: string;

	
	@Column({ nullable: true })
	countryPhoneCode?: string;

	
	@Column({ nullable: true })
	phoneNumber?: string;

	
	@Column({ nullable: true })
	street?: string;

	
	@Column({ nullable: true })
	addressLine2?: string;

	
	@Column({ nullable: true })
	state?: string;

	
	@Column({ nullable: true })
	city?: string;

	
	@Column({ nullable: true })
	country?: string;

	
	@Column({ nullable: true })
	postalCode?: string;

	
	@Column({ nullable: true })
	companyType?: string;

	@Column({ default: false })
	isDeleted?: boolean;

	@OneToMany(() => OrganizationUser, (orgUser) => orgUser.organization, {
		cascade: true,
	})
	users?: OrganizationUser[];

	@DeleteDateColumn({ type: 'timestamptz' })
	@Index('idx_deleted_date')
	deletedDate?: Date;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdDate?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedDate?: Date;

	
	@Column({ nullable: true })
	website?: string;

	
	@Column({ nullable: true })
	logoUrl?: string;

	@OneToMany(() => Property, (property) => property.organization)
	properties?: Property[];

	@OneToMany(() => Transaction, (transaction) => transaction.organization)
	transactions?: Transaction[];

	@OneToOne(() => OrganizationSettings, (settings) => settings.organization, {
		eager: true,
		cascade: ['insert', 'remove'],
	})
	settings?: OrganizationSettings;

	@OneToMany(
		() => OrganizationSubscriptions,
		(subscription) => subscription.organization,
		{
			eager: true,
			cascade: ['insert', 'remove'],
		},
	)
	subscriptions?: OrganizationSubscriptions[];

	@OneToMany(() => PropertyImage, (image) => image.organization, {
		cascade: ['remove'],
	})
	propertyImages?: PropertyImage[];

	@OneToMany(
		() => OrganizationTenants,
		(organizationTenant) => organizationTenant.organization,
	)
	organizationTenants?: OrganizationTenants[];

	@OneToMany(() => OrganizationRole, (orgRole) => orgRole.organization, {
		cascade: true,
	})
	roles?: OrganizationRole[];

	@Column({
		type: 'enum',
		enum: ['individual', 'company', 'ngo', 'government', 'other', 'self'],
		default: 'individual',
	})
	orgType: string;

	@Index('idx_tenant_id')
	@Column({ nullable: true, unique: true })
	tenantId?: string;

	@Column({ nullable: true })
	csrfSecret?: string;
}
