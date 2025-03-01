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
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', length: 50 })
	unitNumber: string;

	@Column('int', { nullable: true })
	floor: number;

	@Column('int', { nullable: true })
	rooms: number;

	@Column('int', { nullable: true })
	offices: number;

	@AutoMap()
	@Column({ type: 'int', nullable: true })
	bedrooms: number;

	@AutoMap()
	@Column({ type: 'int', nullable: true })
	bathrooms: number;

	@Column({ type: 'int', nullable: true })
	toilets: number;

	@Column({ type: 'json', nullable: true })
	area: { value: number; unit: string };

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	rentAmount?: number;

	@Column({
		type: 'enum',
		enum: UnitStatus,
		default: UnitStatus.VACANT,
	})
	status: UnitStatus;

	@ManyToOne(() => Property, (property) => property.units, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'propertyUuid' })
	@Index('IDX_PROPERTY_UUID', ['propertyUuid'])
	property: Property;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedAt: Date;

	@OneToMany(() => Lease, (lease) => lease.unit)
	leases?: Lease[];

	@OneToMany(() => PropertyImage, (image) => image.unit)
	images?: PropertyImage[];

	@Column({ type: 'simple-array', nullable: true })
	amenities?: string[];
}
