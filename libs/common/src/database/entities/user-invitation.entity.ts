import { Organization } from './organization.entity';
import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationRole } from './organization-role.entity';

@Entity({ schema: 'kdo' })
export class UserInvitation {
	@PrimaryGeneratedColumn()
	id?: number;

	@Index()
	@ManyToOne(() => Organization, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({
		name: 'organizationUuid',
		referencedColumnName: 'organizationUuid',
	})
	organization?: Organization;

	@ManyToOne(() => OrganizationRole, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({
		name: 'orgRoleId',
		referencedColumnName: 'id',
	})
	orgRole?: OrganizationRole;

	@Index()
	@Column({ unique: true })
	firebaseUid: string;

	@Column({ type: 'timestamptz' })
	invitedAt: string;

	@Column({ type: 'timestamptz', nullable: true })
	acceptedAt?: string;

	@Column({ type: 'simple-array', nullable: true })
	propertyToOwnIds?: string[];

	@Column({ type: 'simple-array', nullable: true })
	propertyToManageIds?: string[];

	@Index('idx_invitation_token')
	@Column({ type: 'text' })
	token: string;
}
