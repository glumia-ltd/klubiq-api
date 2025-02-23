import { OrganizationUser } from './organization-user.entity';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	Index,
	JoinColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

import { AutoMap } from '@automapper/classes';
import { Organization } from './organization.entity';
import { RoleFeaturePermissions } from './role-feature-permission.entity';

@Entity({ schema: 'poo' })
export class OrganizationRole {
	@AutoMap()
	@PrimaryGeneratedColumn()
	id?: number;

	@AutoMap()
	@Column({ length: 255, unique: true })
	name: string;

	@Column({ nullable: true })
	@Index('idx_role_organization_uuid')
	organizationUuid?: string;

	@AutoMap()
	@Column({ length: 50, nullable: true })
	alias?: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	description?: string;

	@OneToMany(() => OrganizationUser, (orgUser) => orgUser.orgRole)
	users?: OrganizationUser[];

	@AutoMap(() => [RoleFeaturePermissions])
	@OneToMany(() => RoleFeaturePermissions, (rfp) => rfp.role)
	roleFeaturePermissions: RoleFeaturePermissions[];

	@ManyToOne(() => Organization, (organization) => organization.roles, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'organizationUuid' })
	organization?: Organization;

	@CreateDateColumn({
		type: 'timestamptz',
		select: false,
		default: () => 'NOW()',
	})
	createdDate?: Date;

	@UpdateDateColumn({
		type: 'timestamptz',
		select: false,
		default: () => 'NOW()',
	})
	updatedDate?: Date;

	@Column({ default: false })
	isKlubiqInternal?: boolean;
}
