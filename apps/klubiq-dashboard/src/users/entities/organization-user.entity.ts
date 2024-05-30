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
import { UserProfile } from '@app/common';
import { OrganizationRole } from '@app/common';
import { Organization } from '../../organization/entities/organization.entity';
import { AutoMap } from '@automapper/classes';

@Entity({ schema: 'poo' })
export class OrganizationUser {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	organizationUserUuid?: string;

	@AutoMap()
	@Index()
	@Generated('increment')
	@Column({ unique: true })
	organizationUserId?: number;

	@AutoMap()
	@Index()
	@Column({ unique: true })
	firebaseId: string;

	@AutoMap()
	@Column({ default: true })
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
	profile?: UserProfile;

	@AutoMap(() => OrganizationRole)
	@ManyToOne(() => OrganizationRole, { eager: true })
	@JoinColumn({
		name: 'roleId',
		referencedColumnName: 'id',
	})
	orgRole?: OrganizationRole;

	@AutoMap(() => Organization)
	@ManyToOne(() => Organization, { eager: true })
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
