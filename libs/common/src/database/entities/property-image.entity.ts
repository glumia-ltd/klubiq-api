import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { AbstractEntity } from './abstract-entity';
import { Property } from '../../../../../apps/klubiq-dashboard/src/properties/entities/property.entity';
import { Unit } from '../../../../../apps/klubiq-dashboard/src/properties/entities/unit.entity';

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

	@AutoMap()
	@Column({ default: false })
	isMain?: boolean;

	@ManyToOne(() => Property, (property) => property.images, {
		onDelete: 'CASCADE',
	})
	@Index('IDX_PROPERTY_IMAGES_PROPERTY_ID')
	property?: Property;

	@ManyToOne(() => Unit, (unit) => unit.images, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn({ name: 'unitId' })
	@Index('IDX_PROPERTY_IMAGES_UNIT_ID')
	unit: Unit;
}
