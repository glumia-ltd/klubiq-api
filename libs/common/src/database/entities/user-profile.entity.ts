import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToOne,
	Generated,
	JoinColumn,
	Index,
	OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { OrganizationUser } from '../../../../../apps/klubiq-dashboard/src/users/entities/organization-user.entity';
import { AutoMap } from '@automapper/classes';
import { Property } from '../../../../../apps/klubiq-dashboard/src/properties/entities/property.entity';
import { TenantUser } from './tenant.entity';
import { UserPreferences } from './user-preferences.entity';

@Entity({ schema: 'kdo' })
export class UserProfile {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	profileUuid?: string;

	@AutoMap()
	@Index()
	@Generated('increment')
	@Column({ unique: true })
	profileId?: number;

	@AutoMap()
	@Index()
	@Column({ unique: true })
	firebaseId: string;

	@AutoMap()
	@Index()
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

	@AutoMap(() => Role)
	@ManyToOne(() => Role, { eager: true })
	@JoinColumn({
		name: 'roleId',
		referencedColumnName: 'id',
	})
	systemRole?: Role;

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

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;

	@AutoMap(() => [UserPreferences])
	@OneToOne(() => UserPreferences, (preferences) => preferences.profile, {
		eager: true,
		cascade: ['insert', 'remove'],
	})
	preferences: UserPreferences;
}
