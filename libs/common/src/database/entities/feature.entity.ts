import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { FeaturePermission } from './feature-permission.entity';
import { AutoMap } from '@automapper/classes';

@Entity({ schema: 'poo' })
export class Feature {
	@AutoMap()
	@PrimaryGeneratedColumn()
	id?: number;

	@AutoMap()
	@Column({ length: 255, unique: true })
	name: string;

	@AutoMap()
	@Column()
	alias: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	description?: string;

	@AutoMap(() => [FeaturePermission])
	@OneToMany(
		() => FeaturePermission,
		(featurePermission) => featurePermission.feature,
	)
	featurePermissions: FeaturePermission[];

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
