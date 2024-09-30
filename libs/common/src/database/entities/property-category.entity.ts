import { Entity, Column, OneToMany } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { AbstractEntity } from './abstract-entity';
import { Property } from './property.entity';

@Entity({ schema: 'kdo' })
export class PropertyCategory extends AbstractEntity {
	@AutoMap()
	@Column({ length: 255, unique: true })
	name: string;

	@AutoMap()
	@Column({ length: 255, unique: true })
	displayText: string;

	@OneToMany(() => Property, (property) => property.category)
	properties?: Property[];

	@AutoMap()
	@Column('jsonb', { nullable: true })
	metaData?: Record<string, any>;
}
