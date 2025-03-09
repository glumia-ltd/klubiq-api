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

	@Column({ default: true, select: false })
	isPrivate: boolean;

	@CreateDateColumn({
		type: 'timestamptz',
		default: () => 'NOW()',
		select: false,
	})
	createdAt?: Date;

	@UpdateDateColumn({
		type: 'timestamptz',
		default: () => 'NOW()',
		select: false,
	})
	updatedAt?: Date;
}
