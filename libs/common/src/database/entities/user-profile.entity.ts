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
import { AutoMap } from '@automapper/classes';
import { Property } from './property.entity';
import { TenantUser } from './tenant.entity';
import { UserPreferences } from './user-preferences.entity';
import { NotificationSubscription } from './notification-subscription.entity';

@Entity({ schema: 'kdo' })
export class UserProfile {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	profileUuid?: string;

	@AutoMap()
	@Column({ length: 100, nullable: true })
	firstName?: string;

	@Column({ type: 'varchar', length: 50, nullable: true })
	title?: string;

	@AutoMap()
	@Column({ length: 100, nullable: true })
	lastName?: string;

	@AutoMap()
	@Index('IDX_FIREBASE_ID')
	@Column({ unique: true })
	firebaseId: string;

	@AutoMap()
	@Index('IDX_EMAIL')
	@Column({ unique: true })
	email: string;

	@AutoMap()
	@Column({ nullable: true })
	profilePicUrl?: string;

	@AutoMap()
	@Column({ nullable: true })
	phoneNumber?: string;

	@AutoMap()
	@Column({ nullable: true })
	countryPhoneCode?: string;

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
	formOfIdentity?: string;

	@AutoMap()
	@Column({ nullable: true })
	dateOfBirth?: Date;

	@AutoMap()
	@Column({ nullable: true })
	gender?: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	bio?: string;

	@AutoMap()
	@Column({ default: false })
	isTermsAndConditionAccepted?: boolean;

	@AutoMap()
	@Column({ default: false })
	isPrivacyPolicyAgreed?: boolean;

	@AutoMap(() => OrganizationUser)
	@OneToOne(
		() => OrganizationUser,
		(organizationUser) => organizationUser.profile,
		{ eager: true },
	)
	organizationUser?: OrganizationUser;

	@AutoMap(() => TenantUser)
	@OneToOne(() => TenantUser, (tenantUser) => tenantUser.profile, {
		eager: true,
	})
	tenantUser?: TenantUser;

	@AutoMap(() => [Property])
	@OneToMany(() => Property, (property) => property.manager)
	propertiesManaged?: Property[];

	@AutoMap(() => [Property])
	@OneToMany(() => Property, (property) => property.owner)
	propertiesOwned?: Property[];

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdDate?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedDate?: Date;

	@AutoMap(() => [UserPreferences])
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

	@AutoMap()
	@Column({ default: false })
	isKYCVerified?: boolean;
}
