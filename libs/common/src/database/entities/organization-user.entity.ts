import {
	Entity,
	PrimaryGeneratedColumn,
	DeleteDateColumn,
	Column,
	OneToOne,
	Generated,
	JoinColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { OrganizationRole } from './organization-role.entity';
import { Organization } from './organization.entity';
import { AutoMap } from '@automapper/classes';

@Entity({ schema: 'poo' })
export class OrganizationUser {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	organizationUserUuid?: string;

	@AutoMap()
	@Index('IDX_ORG_USER_ID')
	@Generated('increment')
	@Column({ unique: true })
	organizationUserId?: number;

	@AutoMap()
	@Index('IDX_ORG_USER_FIREBASE_ID')
	@Column({ unique: true })
	firebaseId: string;

	@AutoMap()
	@Column({ default: true })
	@Index('IDX_ORG_USER_ACTIVE')
	isActive?: boolean;

	@AutoMap()
	@Column({ length: 100 })
	firstName: string;

	@AutoMap()
	@Column({ length: 100 })
	lastName: string;

	@Column({ default: false })
	isDeleted?: boolean;

	@AutoMap()
	@Column({ default: false })
	isAccountVerified?: boolean;

	@AutoMap(() => UserProfile)
	@OneToOne(() => UserProfile, { cascade: ['update'] })
	@JoinColumn({
		name: 'profileUuid',
		referencedColumnName: 'profileUuid',
	})
	@Index('IDX_PROFILE_ORG_USER')
	profile?: UserProfile;

	@AutoMap(() => OrganizationRole)
	@ManyToOne(() => OrganizationRole, { eager: true })
	@JoinColumn({
		name: 'roleId',
		referencedColumnName: 'id',
	})
	@Index('IDX_ORG_USER_ROLE')
	orgRole?: OrganizationRole;

	@AutoMap(() => Organization)
	@ManyToOne(() => Organization, { eager: true })
	@JoinColumn({
		name: 'organizationUuid',
		referencedColumnName: 'organizationUuid',
	})
	@Index('IDX_ORG_USER_ORGANIZATION')
	organization?: Organization;

	@DeleteDateColumn()
	deletedDate?: Date;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
