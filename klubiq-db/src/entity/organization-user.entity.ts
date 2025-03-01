import {
	Entity,
	PrimaryGeneratedColumn,
	DeleteDateColumn,
	Column,
	OneToOne,
	// Generated,
	JoinColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { OrganizationRole } from './organization-role.entity';
import { Organization } from './organization.entity';

@Entity({ schema: 'poo' })
export class OrganizationUser {
	
	@PrimaryGeneratedColumn('uuid')
	organizationUserUuid?: string;

	@Column({ default: true })
	@Index('IDX_ORG_USER_ACTIVE')
	isActive?: boolean;

	@Column({ default: false })
	isDeleted?: boolean;

	
	@Column({ default: false })
	isAccountVerified?: boolean;

	@OneToOne(() => UserProfile, { cascade: ['update', 'remove'] })
	@JoinColumn({
		name: 'profileUuid',
		referencedColumnName: 'profileUuid',
	})
	@Index('IDX_PROFILE_ORG_USER')
	profile?: UserProfile;

	@ManyToOne(() => OrganizationRole, { eager: true, onDelete: 'RESTRICT' })
	@JoinColumn({
		name: 'roleId',
		referencedColumnName: 'id',
	})
	@Index('IDX_ORG_USER_ROLE')
	orgRole?: OrganizationRole;

	@ManyToOne(() => Organization, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({
		name: 'organizationUuid',
		referencedColumnName: 'organizationUuid',
	})
	@Index('IDX_ORG_USER_ORGANIZATION')
	organization?: Organization;

	@DeleteDateColumn({ type: 'timestamptz' })
	deletedDate?: Date;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdDate?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedDate?: Date;
}
