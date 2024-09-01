import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	Index,
} from 'typeorm';
import { Property } from './property.entity';
import { Lease } from '@app/common/database/entities/lease.entity';
import { AutoMap } from '@automapper/classes';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { UnitStatus } from '@app/common/config/config.constants';

@Entity({ schema: 'poo' })
export class Unit {
	@AutoMap()
	@PrimaryGeneratedColumn({ type: 'bigint' })
	id: number;

	@AutoMap()
	@Column({ type: 'varchar', length: 50 })
	unitNumber: string;

	@AutoMap()
	@Column('int', { nullable: true })
	floor: number;

	@AutoMap()
	@Column('int', { nullable: true })
	rooms: number;

	@AutoMap()
	@Column('int', { nullable: true })
	offices: number;

	@AutoMap()
	@Column({ type: 'int', nullable: true })
	bedrooms: number;

	@AutoMap()
	@Column({ type: 'int', nullable: true })
	bathrooms: number;

	@AutoMap()
	@Column({ type: 'int', nullable: true })
	toilets: number;

	@AutoMap()
	@Column({ type: 'json', nullable: true })
	area: { value: number; unit: string };

	@AutoMap()
	@Column('decimal', { precision: 10, scale: 2 })
	rentAmount?: number;

	@AutoMap()
	@Column({
		type: 'enum',
		enum: UnitStatus,
		default: UnitStatus.VACANT,
	})
	status: UnitStatus;

	@ManyToOne(() => Property, (property) => property.units, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'propertyUuid' })
	@Index('IDX_PROPERTY_UUID', ['propertyUuid'])
	property: Property;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@AutoMap(() => [Lease])
	@OneToMany(() => Lease, (lease) => lease.unit)
	leases?: Lease[];

	@OneToMany(() => PropertyImage, (image) => image.unit, { cascade: true })
	images: PropertyImage[];
}
