import { Entity, Column, OneToMany } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { AbstractEntity } from './abstract-entity';
import { Property } from '../../../../../apps/klubiq-dashboard/src/properties/entities/property.entity';

@Entity({ schema: 'kdo' })
export class PropertyType extends AbstractEntity {
	@AutoMap()
	@Column({ length: 255, unique: true })
	name: string;

	@AutoMap()
	@Column({ length: 255, unique: true })
	displayText: string;

	@OneToMany(() => Property, (property) => property.category)
	properties?: Property[];
}
