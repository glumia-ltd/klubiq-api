import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'poo' })
export class OrganizationCounter {
	@PrimaryGeneratedColumn({ type: 'bigint' })
	public id?: number;

	@Column({ type: 'uuid' })
	@Index('idx_counter_organization_uuid')
	organization_uuid: string;

	@Column({ type: 'bigint', default: 0 })
	property_count: number;

	@Column({ type: 'bigint', default: 0 })
	unit_count: number;

	@Column({ type: 'bigint', default: 0 })
	user_count: number;

	@Column({ type: 'bigint', default: 0 })
	document_storage_size: number;

	@CreateDateColumn({ type: 'timestamp with time zone' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updated_at: Date;
}
