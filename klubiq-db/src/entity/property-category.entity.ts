import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { Property } from './property.entity';

@Entity({ schema: 'kdo' })
export class PropertyCategory extends AbstractEntity {
	
	@Column({ length: 255, unique: true })
	name: string;

	
	@Column({ length: 255, unique: true })
	displayText: string;

	@OneToMany(() => Property, (property) => property.category)
	properties?: Property[];

	
	@Column('jsonb', { nullable: true })
	metaData?: Record<string, any>;
}
