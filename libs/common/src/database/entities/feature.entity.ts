import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
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

	@OneToMany(
		() => FeaturePermission,
		(featurePermission) => featurePermission.feature,
	)
	featurePermissions?: FeaturePermission[];

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
