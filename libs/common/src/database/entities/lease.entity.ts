import { AutoMap } from '@automapper/classes';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Property } from '../../../../../apps/klubiq-dashboard/src/properties/entities/property.entity';
import { Transaction } from './transaction.entity';
import { LeaseStatus, PaymentFrequency } from '../../config/config.constants';

@Entity({ schema: 'poo' })
export class Lease {
	@AutoMap()
	@PrimaryGeneratedColumn()
	id?: number;

	@AutoMap()
	@Index()
	@Column({ length: 255, unique: true, nullable: false })
	name?: string;

	@AutoMap()
	@Column({
		type: 'enum',
		enum: PaymentFrequency,
		default: PaymentFrequency.ANNUALLY,
	})
	paymentFrequency: PaymentFrequency;

	@AutoMap()
	@Column({
		type: 'enum',
		enum: LeaseStatus,
		default: LeaseStatus.NEW,
	})
	status?: LeaseStatus;

	@AutoMap()
	@Column({ default: 0 })
	customPaymentFrequency?: number;

	@AutoMap()
	@Column({ type: 'date' })
	startDate?: Date;

	@AutoMap()
	@Column({ type: 'date' })
	endDate?: Date;

	@AutoMap()
	@Column({ type: 'int', nullable: true })
	rentDueDay?: number;

	@AutoMap()
	@Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
	rentAmount?: number;

	@AutoMap()
	@Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
	securityDeposit?: number;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;

	@DeleteDateColumn({ nullable: true })
	deletedAt?: Date;

	@AutoMap()
	@Column({ default: false })
	isDraft?: boolean;

	@AutoMap()
	@Column({ default: false })
	isArchived?: boolean;

	@AutoMap(() => [UserProfile])
	@ManyToMany(() => UserProfile, (user) => user.leases)
	@JoinTable({
		name: 'tenants_leases',
		joinColumn: {
			name: 'leaseId',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'tenantUid',
			referencedColumnName: 'firebaseId',
		},
	})
	tenants?: UserProfile[];

	@AutoMap(() => Property)
	@Index()
	@ManyToOne(() => Property, (property) => property.leases)
	@JoinColumn({ name: 'propertyUuId', referencedColumnName: 'uuid' })
	property?: Property;

	@AutoMap(() => [Transaction])
	@OneToMany(() => Transaction, (transaction) => transaction.lease)
	transactions?: Transaction[];
}
