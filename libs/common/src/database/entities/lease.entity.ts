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
//import { Property } from '../../../../../apps/klubiq-dashboard/src/properties/entities/property.entity';
import { Transaction } from './transaction.entity';
import { LeaseStatus, PaymentFrequency } from '../../config/config.constants';
import { TenantUser } from './tenant.entity';
import { Unit } from '../../../../../apps/klubiq-dashboard/src/properties/entities/unit.entity';

@Entity({ schema: 'poo' })
@Index('idx_lease_dates_status', ['startDate', 'endDate', 'status'])
@Index('idx_lease_dates', ['startDate', 'endDate'])
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
	@Index('idx_lease_payment_frequency')
	paymentFrequency: PaymentFrequency;

	@AutoMap()
	@Column({
		type: 'enum',
		enum: LeaseStatus,
		default: LeaseStatus.NEW,
	})
	@Index('idx_lease_status')
	status?: LeaseStatus;

	@AutoMap()
	@Column({ default: 0 })
	@Index('idx_lease_custom_payment_frequency')
	customPaymentFrequency?: number;

	@AutoMap()
	@Column({ type: 'date' })
	@Index('idx_lease_start_date')
	startDate?: Date;

	@AutoMap()
	@Column({ type: 'date' })
	@Index('idx_lease_end_date')
	endDate?: Date;

	@AutoMap()
	@Column({ type: 'int', nullable: true })
	@Index('idx_lease_rent_due_day')
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

	@AutoMap(() => [TenantUser])
	@ManyToMany(() => TenantUser, (user) => user.leases)
	@JoinTable({
		name: 'leases_tenants',
		joinColumn: {
			name: 'leaseId',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'tenantId',
			referencedColumnName: 'id',
		},
	})
	tenants?: TenantUser[];

	@AutoMap(() => Unit)
	@Index('IDX_UNIT_UUID')
	@ManyToOne(() => Unit, (unit) => unit.leases, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'unitId' })
	unit: Unit;

	@AutoMap(() => [Transaction])
	@OneToMany(() => Transaction, (transaction) => transaction.lease)
	transactions?: Transaction[];

	tenant_firstname?: string;
	tenant_lastname?: string;
	property_name?: string;
	property_organizationuuid?: string;
	property_manageruid?: string;
	property_owneruid?: string;
	unit_unitnumber?: string;
}
