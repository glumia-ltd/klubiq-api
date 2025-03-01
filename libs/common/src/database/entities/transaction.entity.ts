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
import { Lease } from './lease.entity';
import {
	PaymentStatus,
	RevenueType,
	TransactionType,
} from '../../config/config.constants';
import { Organization } from './organization.entity';

@Entity({ schema: 'poo' })
export class Transaction {
	@PrimaryGeneratedColumn('uuid')
	uuid?: string;

	@Index()
	@Column({ unique: true })
	code: string;

	@Column({ type: 'date' })
	transactionDate?: Date;

	@Column({ type: 'decimal', precision: 18, scale: 2 })
	amount: number;

	@Column({ type: 'enum', enum: TransactionType })
	type: TransactionType;

	@Column({ type: 'enum', enum: RevenueType, nullable: true })
	revenueType: RevenueType;

	@CreateDateColumn({
		type: 'timestamptz',
		select: false,
		default: () => 'NOW()',
	})
	createdDate?: Date;

	@CreateDateColumn({
		type: 'timestamptz',
		select: false,
		default: () => 'NOW()',
	})
	updatedDate?: Date;

	@DeleteDateColumn({ nullable: true })
	deletedAt?: Date;

	@Index()
	@ManyToOne(() => Lease, (lease) => lease.transactions, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'leaseId', referencedColumnName: 'id' })
	lease?: Lease;

	@Index()
	@ManyToOne(() => Organization, (organization) => organization.transactions, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({
		name: 'organizationUuid',
		referencedColumnName: 'organizationUuid',
	})
	organization?: Organization;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
	status: PaymentStatus;
}
