import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToMany,
	OneToOne,
	Generated,
	JoinTable,
} from 'typeorm';
import { Role } from './role.entity';
import { OrganizationUser } from '../../../../../apps/klubiq-dashboard/src/users/entities/organization-user.entity';

@Entity({ schema: 'kdo' })
export class UserProfile {
	@PrimaryGeneratedColumn('uuid')
	profileUuid?: string;

	@Generated('increment')
	@Column({ unique: true })
	profileId?: number;

	@Column({ unique: true })
	firebaseId: string;

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

	@ManyToMany(() => Role)
	@JoinTable({
		name: 'user_profile_roles',
		joinColumn: {
			name: 'userProfileId',
			referencedColumnName: 'profileUuid',
		},
		inverseJoinColumn: {
			name: 'roleId',
			referencedColumnName: 'id',
		},
	})
	roles?: Role[];

	@OneToOne(
		() => OrganizationUser,
		(organizationUser) => organizationUser.profile,
		{
			cascade: ['insert'],
		},
	)
	organizationUser?: OrganizationUser;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
