import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	Index,
	OneToMany,
} from 'typeorm';
import { OrganizationUser } from './organization-user.entity';
import { Property } from './property.entity';
import { TenantUser } from './tenant.entity';
import { UserPreferences } from './user-preferences.entity';
import { NotificationSubscription } from './notification-subscription.entity';

@Entity({ schema: 'kdo' })
export class UserProfile {
	
	@PrimaryGeneratedColumn('uuid')
	profileUuid?: string;

	
	@Column({ length: 100, nullable: true })
	firstName?: string;

	@Column({ type: 'varchar', length: 50, nullable: true })
	title?: string;

	
	@Column({ length: 100, nullable: true })
	lastName?: string;

	
	@Index('IDX_FIREBASE_ID')
	@Column({ unique: true })
	firebaseId: string;

	
	@Index('IDX_EMAIL')
	@Column({ unique: true })
	email: string;

	
	@Column({ nullable: true })
	profilePicUrl?: string;

	
	@Column({ nullable: true })
	phoneNumber?: string;

	
	@Column({ nullable: true })
	countryPhoneCode?: string;


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
	formOfIdentity?: string;


	@Column({ nullable: true })
	dateOfBirth?: Date;


	@Column({ nullable: true })
	gender?: string;


	@Column({ type: 'text', nullable: true })
	bio?: string;

	@Column({ default: false })
	isTermsAndConditionAccepted?: boolean;

	@Column({ default: false })
	isPrivacyPolicyAgreed?: boolean;

	@OneToOne(
		() => OrganizationUser,
		(organizationUser) => organizationUser.profile,
		{ eager: true },
	)
	organizationUser?: OrganizationUser;


	@OneToOne(() => TenantUser, (tenantUser) => tenantUser.profile, {
		eager: true,
	})
	tenantUser?: TenantUser;


	@OneToMany(() => Property, (property) => property.manager)
	propertiesManaged?: Property[];


	@OneToMany(() => Property, (property) => property.owner)
	propertiesOwned?: Property[];

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdDate?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedDate?: Date;


	@OneToOne(() => UserPreferences, (preferences) => preferences.profile, {
		eager: true,
		cascade: ['insert', 'remove'],
	})
	preferences: UserPreferences;

	@OneToOne(
		() => NotificationSubscription,
		(subscription) => subscription.user,
		{
			eager: true,
			cascade: ['insert', 'remove'],
		},
	)
	notificationSubscription?: NotificationSubscription;

	@Column({ default: false })
	isKYCVerified?: boolean;
}

