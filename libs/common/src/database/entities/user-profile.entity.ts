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
} from 'typeorm';
import { Role } from './role.entity';
import { OrganizationUser } from '../../../../../apps/klubiq-dashboard/src/users/entities/organization-user.entity';

@Entity({ schema: 'kdo' })
export class UserProfile {
	@PrimaryGeneratedColumn('uuid')
	profileUuid?: string;

	@Index()
	@Generated('increment')
	@Column({ unique: true })
	profileId?: number;

	@Index()
	@Column({ unique: true })
	firebaseId: string;

	@Index()
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

	@ManyToOne(() => Role, { eager: true })
	@JoinColumn({
		name: 'roleId',
		referencedColumnName: 'id',
	})
	systemRole?: Role;

	@OneToOne(
		() => OrganizationUser,
		(organizationUser) => organizationUser.profile,
	)
	organizationUser?: OrganizationUser;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
