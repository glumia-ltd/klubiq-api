import { Entity, Column, Index } from 'typeorm';
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
}
