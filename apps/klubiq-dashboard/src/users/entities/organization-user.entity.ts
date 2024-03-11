import {
	Entity,
	PrimaryGeneratedColumn,
	DeleteDateColumn,
	Column,
	OneToOne,
	Generated,
	JoinColumn,
	ManyToOne,
} from 'typeorm';
import { UserProfile } from '@app/common';
import { OrganizationRole } from './organization-role.entity';

@Entity({ schema: 'poo' })
export class OrganizationUser {
	@PrimaryGeneratedColumn('uuid')
	organizationUserUuid?: string;

	@Generated('increment')
	organizationUserId?: number;

	@Column({ unique: true })
	firebaseId: string;

	@Column({ default: true })
	isActive?: boolean;

	@Column({ length: 100 })
	firstName: string;

	@Column({ length: 100 })
	lastName: string;

	@Column({ default: false })
	isDeleted?: boolean;

	@Column({ default: false })
	isAccountVerified?: boolean;

	@OneToOne(() => UserProfile)
	@JoinColumn({
		name: 'profileUuid',
		referencedColumnName: 'profileUuid',
	})
	profile?: UserProfile;

	@ManyToOne(() => OrganizationRole)
	@JoinColumn({
		name: 'roleId',
		referencedColumnName: 'id',
	})
	role?: OrganizationRole;

	@DeleteDateColumn()
	deletedDate?: Date;
}
