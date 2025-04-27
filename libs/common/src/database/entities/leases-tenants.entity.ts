import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	Index,
} from 'typeorm';
import { Lease } from './lease.entity';
import { TenantUser } from './tenant.entity';
import { AutoMap } from '@automapper/classes';

@Entity({ schema: 'poo' })
@Index(['leaseId', 'tenantId'], { unique: true }) // for the composite unique index
export class LeaseTenant {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@AutoMap()
	@Column({ type: 'uuid' })
	leaseId: string;

	@AutoMap(() => [Lease])
	@ManyToOne(() => Lease, (lease) => lease.tenants, {
		cascade: false,
		onDelete: 'NO ACTION', // or 'SET NULL' if nullable
		nullable: false,
		eager: false,
	})
	@JoinColumn({ name: 'leaseId' })
	lease: Lease;

	@AutoMap()
	@Column({ type: 'uuid' })
	tenantId: string;

	@AutoMap(() => [TenantUser])
	@ManyToOne(() => TenantUser, (tenant) => tenant.leases, {
		cascade: false,
		onDelete: 'NO ACTION', // or 'SET NULL' if nullable
		nullable: false,
		eager: false,
	})
	@JoinColumn({ name: 'tenantId' })
	tenant: TenantUser;
}
