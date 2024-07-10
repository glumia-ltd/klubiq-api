import { AutoMap } from '@automapper/classes';
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
import { TransactionType } from '../../config/config.constants';
import { Organization } from '../../../../../apps/klubiq-dashboard/src/organization/entities/organization.entity';

@Entity({ schema: 'poo' })
export class Transaction {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	uuid?: string;

	@AutoMap()
	@Index()
	@Column({ unique: true })
	code: string;

	@AutoMap()
	@Column({ type: 'timestamp' })
	transactionDate?: Date;

	@AutoMap()
	@Column({ type: 'decimal', precision: 18, scale: 2 })
	amount: number;

	@AutoMap()
	@Column({ type: 'enum', enum: TransactionType })
	type: TransactionType;

	@CreateDateColumn({ select: false })
	createdDate?: Date;

	@DeleteDateColumn({ nullable: true })
	deletedAt?: Date;

	@AutoMap(() => Lease)
	@Index()
	@ManyToOne(() => Lease, (lease) => lease.transactions)
	@JoinColumn({ name: 'leaseId', referencedColumnName: 'id' })
	lease?: Lease;

	@AutoMap(() => Organization)
	@Index()
	@ManyToOne(() => Organization, (organization) => organization.transactions)
	@JoinColumn({
		name: 'organizationUuid',
		referencedColumnName: 'organizationUuid',
	})
	organization?: Organization;
}
