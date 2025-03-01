
import { Property } from './property.entity';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { MaintenancePriority, MaintenanceStatus, MaintenanceType } from '../types/enums';

@Entity({ schema: 'poo' })
export class Maintenance {
	
	@PrimaryGeneratedColumn('uuid')
	id?: number;

	
	@Column({ type: 'timestamp with time zone' })
	startDate: Date;

	
	@Column({ type: 'date', nullable: true })
	dueDate?: Date;

	
	@Column({ type: 'timestamp with time zone', nullable: true })
	endDate?: Date;

	@CreateDateColumn({
		type: 'timestamptz',
		select: false,
		default: () => 'NOW()',
	})
	createdDate?: Date;

	@UpdateDateColumn({
		type: 'timestamptz',
		select: false,
		default: () => 'NOW()',
	})
	updatedDate?: Date;

	
	@Column({ type: 'varchar' })
	title: string;

	
	@Column({ type: 'text' })
	description: string;

	
	@Column({ type: 'simple-array', nullable: true })
	images?: string[];

	
	@Column({ type: 'simple-array', nullable: true })
	notes?: string[];

	
	@Column({
		type: 'enum',
		enum: MaintenanceStatus,
		default: MaintenanceStatus.NEW,
	})
	status: MaintenanceStatus;

	
	@Column({
		type: 'enum',
		enum: MaintenancePriority,
		default: MaintenancePriority.LOW,
	})
	priority: MaintenancePriority;

	
	@Column({
		type: 'enum',
		enum: MaintenanceType,
		default: MaintenanceType.MAINTENANCE,
	})
	type: MaintenanceType;

	@DeleteDateColumn({ nullable: true })
	deletedAt?: Date;


	@Index()
	@ManyToOne(() => Property, (property) => property.maintenances, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'propertyUuId', referencedColumnName: 'uuid' })
	property?: Property;
}
