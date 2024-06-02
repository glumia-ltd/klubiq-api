import {
	MaintenancePriority,
	MaintenanceStatus,
	MaintenanceType,
} from '../../config/config.constants';
import { AutoMap } from '@automapper/classes';
import { Property } from '../../../../../apps/klubiq-dashboard/src/properties/entities/property.entity';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ schema: 'poo' })
export class Maintenance {
	@AutoMap()
	@PrimaryGeneratedColumn('identity')
	id?: number;

	@AutoMap()
	@Column({ type: 'timestamp with time zone' })
	startDate: Date;

	@AutoMap()
	@Column({ type: 'date', nullable: true })
	dueDate?: Date;

	@AutoMap()
	@Column({ type: 'timestamp with time zone', nullable: true })
	endDate?: Date;

	@CreateDateColumn({ select: false })
	createdDate?: Date;

	@AutoMap()
	@Column({ type: 'varchar' })
	title: string;

	@AutoMap()
	@Column({ type: 'text' })
	description: string;

	@AutoMap()
	@Column({ type: 'simple-array', nullable: true })
	images?: string[];

	@AutoMap()
	@Column({ type: 'simple-array', nullable: true })
	notes?: string[];

	@AutoMap()
	@Column({
		type: 'enum',
		enum: MaintenanceStatus,
		default: MaintenanceStatus.NEW,
	})
	status: MaintenanceStatus;

	@AutoMap()
	@Column({
		type: 'enum',
		enum: MaintenancePriority,
		default: MaintenancePriority.LOW,
	})
	priority: MaintenancePriority;

	@AutoMap()
	@Column({
		type: 'enum',
		enum: MaintenanceType,
		default: MaintenanceType.MAINTENANCE,
	})
	type: MaintenanceType;

	@DeleteDateColumn({ nullable: true })
	deletedAt?: Date;

	@AutoMap(() => Property)
	@Index()
	@ManyToOne(() => Property, (property) => property.maintenances, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'propertyUuId', referencedColumnName: 'uuid' })
	property?: Property;
}
