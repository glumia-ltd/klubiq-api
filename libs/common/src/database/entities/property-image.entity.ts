import { Entity, Column, ManyToOne } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { AbstractEntity } from './abstract-entity';
import { Property } from '../../../../../apps/klubiq-dashboard/src/properties/entities/property.entity';

@Entity({ schema: 'kdo' })
export class PropertyImage extends AbstractEntity {
	@AutoMap()
	@Column()
	url: string;

	@AutoMap()
	@Column({
		type: 'timestamptz',
		nullable: true,
		default: () => 'CURRENT_TIMESTAMP',
	})
	uploadDate?: Date;

	@AutoMap()
	@Column({ type: 'decimal', nullable: true })
	fileSize?: number;

	@ManyToOne(() => Property, (property) => property.images)
	property?: Property;
}
