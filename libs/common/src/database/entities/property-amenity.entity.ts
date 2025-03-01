import {
	Entity,
	Column,
	Index,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { AbstractEntity } from './abstract-entity';

@Entity({ schema: 'kdo' })
export class Amenity extends AbstractEntity {
	@AutoMap()
	@Index()
	@Column({ length: 50, unique: true })
	name: string;

	@Column({ default: true })
	isPrivate: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedAt?: Date;
}
