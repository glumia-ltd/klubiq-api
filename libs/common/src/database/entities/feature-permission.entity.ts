import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	ManyToMany,
} from 'typeorm';

import { Feature } from './feature.entity';
import { Permission } from './permission.entity';
import { OrganizationRole } from './organization-role.entity';
import { AutoMap } from '@automapper/classes';

@Entity({ schema: 'poo' })
export class FeaturePermission {
	@AutoMap()
	@PrimaryGeneratedColumn()
	featurePermissionId?: number;

	@AutoMap()
	@Column()
	permissionId: number;

	@AutoMap()
	@Column()
	featureId: number;

	@AutoMap()
	@Column({ length: 255, unique: true })
	alias?: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	description?: string;

	@AutoMap(() => Permission)
	@ManyToOne(() => Permission, (permission) => permission.featurePermissions, {
		eager: true,
	})
	permission?: Permission;

	@AutoMap(() => Feature)
	@ManyToOne(() => Feature, (feature) => feature.featurePermissions, {
		eager: true,
	})
	feature?: Feature;

	@ManyToMany(
		() => OrganizationRole,
		(organizationRole) => organizationRole.featurePermissions,
	)
	organizationRoles?: OrganizationRole[];
}
