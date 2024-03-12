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
} from 'typeorm';
import { UserProfile } from '@app/common';
import { OrganizationRole } from './organization-role.entity';
import { Organization } from './organization.entity';

@Entity({ schema: 'poo' })
export class OrganizationUser {
	@PrimaryGeneratedColumn('uuid')
	organizationUserUuid?: string;

	@Generated('increment')
	@Column({ unique: true })
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

	@ManyToOne(() => Organization)
	@JoinColumn({
		name: 'organizationUuid',
		referencedColumnName: 'organizationUuid',
	})
	organization?: Organization;

	@DeleteDateColumn()
	deletedDate?: Date;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
