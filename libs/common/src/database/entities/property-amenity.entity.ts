import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { AbstractEntity } from './abstract-entity';
import { Property } from '../../../../../apps/klubiq-dashboard/src/properties/entities/property.entity';

@Entity({ schema: 'kdo' })
export class Amenity extends AbstractEntity {
	@AutoMap()
	@Index()
	@Column({ length: 50, unique: true })
	name: string;

	@ManyToMany(() => Property, (property) => property.amenities)
	properties?: Property[];
}
