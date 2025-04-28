import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	Index,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Lease } from './lease.entity';
import { TenantUser } from './tenant.entity';

@Entity({ schema: 'poo' })
@Index(['leaseId', 'tenantId'], { unique: true }) // for the composite unique index
export class LeasesTenants {

	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@Column({ type: 'uuid' })
	leaseId: string;

	@ManyToOne(() => Lease, (lease) => lease.tenants, {
		cascade: false,
		onDelete: 'NO ACTION', // or 'SET NULL' if nullable
		nullable: false,
		eager: false,
	})
	@JoinColumn({ name: 'leaseId' })
	lease: Lease;

	@Column({ type: 'uuid' })
	tenantId: string;

	@ManyToOne(() => TenantUser, (tenant) => tenant.leases, {
		cascade: false,
		onDelete: 'NO ACTION', // or 'SET NULL' if nullable
		nullable: false,
		eager: false,
	})
	@JoinColumn({ name: 'tenantId' })
	tenant: TenantUser;

	@Column({ type: 'boolean', default: false })
	isPrimaryTenant: boolean;

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
}
