
import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { OrganizationSubscriptions } from './organization-subscriptions.entity';
import { Organization } from './organization.entity';

@Entity({ schema: 'kdo' })
export class SubscriptionPlan {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	@Index('subscription_plan_name', { unique: true })
	name: string;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	monthly_price: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	annual_price: number;

	@Column()
	currency: string;

	// Limits for number of properties, units, users, tenants
	@Column({ nullable: true })
	property_limit: number;

	@Column({ nullable: true })
	unit_limit: number;

	@Column({ nullable: true })
	user_limit: number;

	// @Column({ nullable: true })
	// tenant_limit: number;

	// Feature-specific limits and flags
	@Column({ default: false })
	custom_branding?: boolean;

	@Column({ default: false })
	api_access?: boolean;

	@Column({ nullable: true })
	document_storage_limit: number; // In MB

	@Column()
	support_type: string; // e.g., 'basic', 'priority'

	// Other subscription-specific details
	@Column({ default: false })
	automated_rent_collection: boolean;

	@Column({ default: false })
	multi_currency_support: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedAt?: Date;

	@OneToMany(
		() => OrganizationSubscriptions,
		(organization) => organization.subscription_plan,
	)
	organizations?: Organization[];
}
