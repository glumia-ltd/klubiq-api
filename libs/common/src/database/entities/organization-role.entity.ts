import { OrganizationUser } from '../../../../../apps/klubiq-dashboard/src/users/entities/organization-user.entity';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToMany,
	JoinTable,
} from 'typeorm';

import { FeaturePermission } from './feature-permission.entity';
import { AutoMap } from '@automapper/classes';

@Entity({ schema: 'poo' })
export class OrganizationRole {
	@PrimaryGeneratedColumn()
	id?: number;

	@AutoMap()
	@Column({ length: 255, unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;

	@OneToMany(() => OrganizationUser, (orgUser) => orgUser.orgRole)
	users?: OrganizationUser[];

	@ManyToMany(
		() => FeaturePermission,
		(featurePermission) => featurePermission.organizationRoles,
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
	featurePermissions: FeaturePermission[];
}
