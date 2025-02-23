import {
	Entity,
	Column,
	ManyToOne,
	PrimaryColumn,
	OneToMany,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

import { Feature } from './feature.entity';
import { Permission } from './permission.entity';
import { AutoMap } from '@automapper/classes';
import { RoleFeaturePermissions } from './role-feature-permission.entity';

@Entity({ schema: 'poo' })
export class FeaturePermission {
	@AutoMap()
	@Column()
	@PrimaryColumn()
	permissionId: number;

	@AutoMap()
	@Column()
	@PrimaryColumn()
	featureId: number;

	@AutoMap(() => Permission)
	@ManyToOne(() => Permission, (permission) => permission.featurePermissions, {
		eager: true,
	})
	@JoinColumn({ name: 'permissionId' })
	permission?: Permission;

	@AutoMap(() => Feature)
	@ManyToOne(() => Feature, (feature) => feature.featurePermissions, {
		eager: true,
	})
	@JoinColumn({ name: 'featureId' })
	feature?: Feature;

	@OneToMany(() => RoleFeaturePermissions, (rfp) => rfp.featurePermission)
	roleFeaturePermissions: RoleFeaturePermissions[];

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
}
