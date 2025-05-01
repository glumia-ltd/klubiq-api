import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Unit } from './unit.entity';
import { LeaseStatus, PaymentFrequency } from '../types/enums';
import { LeasesTenants } from './leases-tenants';

@Entity({ schema: 'poo' })
@Index('idx_lease_dates_status', ['startDate', 'endDate', 'status'])
@Index('idx_lease_dates', ['startDate', 'endDate'])
@Index('idx_lease_start_last_payment_freq', [
	'startDate',
	'lastPaymentDate',
	'paymentFrequency',
])
export class Lease {
	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@Index()
	@Column({ length: 255, nullable: true })
	name?: string;

	@Column({
		type: 'enum',
		enum: PaymentFrequency,
		default: PaymentFrequency.ANNUALLY,
	})
	@Index('idx_lease_payment_frequency')
	paymentFrequency: PaymentFrequency;

	@Column({
		type: 'enum',
		enum: LeaseStatus,
		default: LeaseStatus.INACTIVE,
	})
	@Index('idx_lease_status')
	status?: LeaseStatus;

	@Column({ default: 0 })
	@Index('idx_lease_custom_payment_frequency')
	customPaymentFrequency?: number;

	@Column({ type: 'date' })
	@Index('idx_lease_start_date')
	startDate?: Date;

	@Column({ type: 'date' })
	@Index('idx_lease_end_date')
	endDate?: Date;

	@Column({ type: 'date', nullable: true })
	@Index('idx_lease_last_payment_date')
	lastPaymentDate?: Date;

	@Column({ type: 'date', nullable: true })
	@Index('idx_lease_next_due_date')
	nextDueDate?: Date;

	@Column({ type: 'int', nullable: true })
	@Index('idx_lease_rent_due_day')
	rentDueDay?: number;

	@Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
	rentAmount?: number;

	@Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
	securityDeposit?: number;

	@Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
	lateFeeAmount?: number;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdDate?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedDate?: Date;

	@DeleteDateColumn({ nullable: true })
	deletedAt?: Date;

	@Column({ default: false })
	isDraft?: boolean;

	@Column({ default: false })
	isArchived?: boolean;

	@OneToMany(() => LeasesTenants, (leasesTenants) => leasesTenants.lease)
	leasesTenants?: LeasesTenants[];

	@Index('IDX_UNIT_UUID')
	@ManyToOne(() => Unit, (unit) => unit.leases, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'unitId' })
	unit: Unit;

	@OneToMany(() => Transaction, (transaction) => transaction.lease)
	transactions?: Transaction[];

	@Index('IDX_LEASE_ORGANIZATION_UUID')
	@Column({ type: 'uuid', nullable: true })
	organizationUuid?: string;
}
