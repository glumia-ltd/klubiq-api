import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { FeaturePermission } from './feature-permission.entity';


@Entity({ schema: 'poo' })
export class Feature {

	@PrimaryGeneratedColumn()
	id?: number;

	
	@Column({ length: 255, unique: true })
	name: string;

	
	@Column()
	alias: string;

	
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
