import { Entity, Column, ManyToMany } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { AbstractEntity } from './abstract-entity';
import { Property } from '../../../../../apps/klubiq-dashboard/src/properties/entities/property.entity';

@Entity({ schema: 'kdo' })
export class PropertyAmenity extends AbstractEntity {
	@AutoMap()
	@Column({ length: 255, unique: true })
	name: string;

	@ManyToMany(() => Property, (property) => property.amenities)
	properties?: Property[];
}
