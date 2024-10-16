import { OrganizationUser } from './organization-user.entity';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToMany,
	JoinTable,
} from 'typeorm';

import { FeaturePermission } from './feature-permission.entity';
import { AutoMap } from '@automapper/classes';

@Entity({ schema: 'poo' })
export class OrganizationRole {
	@AutoMap()
	@PrimaryGeneratedColumn()
	id?: number;

	@AutoMap()
	@Column({ length: 255, unique: true })
	name: string;

	@AutoMap()
	@Column({ length: 50, nullable: true })
	alias?: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	description?: string;

	@OneToMany(() => OrganizationUser, (orgUser) => orgUser.orgRole)
	users?: OrganizationUser[];

	@AutoMap(() => [FeaturePermission])
	@ManyToMany(
		() => FeaturePermission,
		(featurePermission) => featurePermission.organizationRoles,
		{ eager: true },
	)
	@JoinTable({
		name: 'role_feature_permissions',
		joinColumn: {
			name: 'roleId',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'featurePermissionId',
			referencedColumnName: 'featurePermissionId',
		},
	})
	featurePermissions?: FeaturePermission[];
}
