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
import { AutoMap } from '@automapper/classes';
import { Property } from './property.entity';
import { Transaction } from '@app/common/database/entities/transaction.entity';
import { OrganizationSettings } from '@app/common/database/entities/organization-settings.entity';
import { OrganizationSubscriptions } from '@app/common/database/entities/organization-subscriptions.entity';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { OrganizationTenants } from './organization-tenants.entity';
import { OrganizationRole } from './organization-role.entity';

@Entity({ schema: 'poo' })
export class Organization {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	organizationUuid?: string;

	@AutoMap()
	@Column({ default: true })
	isActive?: boolean;

	@AutoMap()
	@Index()
	@Column({ length: 100, nullable: true })
	name?: string;

	@AutoMap()
	@Column({ default: false })
	isVerified?: boolean;

	@AutoMap()
	@Column({ default: false })
	isKYBVerified?: boolean;

	@AutoMap()
	@Column({ nullable: true })
	email?: string;

	@AutoMap()
	@Column({ nullable: true })
	govRegistrationNumber?: string;

	@AutoMap()
	@Column({ nullable: true })
	countryPhoneCode?: string;

	@AutoMap()
	@Column({ nullable: true })
	phoneNumber?: string;

	@AutoMap()
	@Column({ nullable: true })
	street?: string;

	@AutoMap()
	@Column({ nullable: true })
	addressLine2?: string;

	@AutoMap()
	@Column({ nullable: true })
	state?: string;

	@AutoMap()
	@Column({ nullable: true })
	city?: string;

	@AutoMap()
	@Column({ nullable: true })
	country?: string;

	@AutoMap()
	@Column({ nullable: true })
	postalCode?: string;

	@AutoMap()
	@Column({ nullable: true })
	companyType?: string;

	@Column({ default: false })
	isDeleted?: boolean;

	@AutoMap(() => [OrganizationUser])
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

	@AutoMap()
	@Column({ nullable: true })
	website?: string;

	@AutoMap()
	@Column({ nullable: true })
	logoUrl?: string;

	@AutoMap(() => [Property])
	@OneToMany(() => Property, (property) => property.organization)
	properties?: Property[];

	@AutoMap(() => [Transaction])
	@OneToMany(() => Transaction, (transaction) => transaction.organization)
	transactions?: Transaction[];

	@AutoMap(() => [OrganizationSettings])
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

	@AutoMap(() => [OrganizationRole])
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
