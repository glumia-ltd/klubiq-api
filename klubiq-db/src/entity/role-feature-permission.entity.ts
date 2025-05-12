import {
	Entity,
	Column,
	ManyToOne,
	PrimaryGeneratedColumn,
	JoinColumn,
	Index,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

import { FeaturePermission } from './feature-permission.entity';
import { OrganizationRole } from './organization-role.entity';

@Entity({ schema: 'poo' })
@Index(['role', 'featureId', 'permissionId'], { unique: true }) // Ensure unique combination
export class RoleFeaturePermissions {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'integer' })
	roleId: number;

	@Column({ type: 'integer' })
	featureId: number;

	@Column({ type: 'integer' })
	permissionId: number;

	@ManyToOne(() => OrganizationRole, (role) => role.roleFeaturePermissions, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'roleId' })
	role: OrganizationRole;

	@ManyToOne(
		() => FeaturePermission,
		(featurePermission) => featurePermission.roleFeaturePermissions,
		{
			onDelete: 'CASCADE', // or 'RESTRICT' depending on your needs
		},
	)
	@JoinColumn([
		{ name: 'featureId', referencedColumnName: 'featureId' },
		{ name: 'permissionId', referencedColumnName: 'permissionId' },
	])
	featurePermission: FeaturePermission;

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

	@Column({
		nullable: true,
		length: 255,
	})
	description?: string;
}
