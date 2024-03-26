import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';

import { FeaturePermission } from './feature-permission.entity';

@Entity({ schema: 'poo' })
export class Permission {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column({ length: 255, unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;

	@OneToMany(
		() => FeaturePermission,
		(featurePermission) => featurePermission.permission,
	)
	featurePermissions: FeaturePermission[];
}
