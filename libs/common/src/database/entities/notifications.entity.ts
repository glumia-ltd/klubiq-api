import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Unit } from './unit.entity';
import { UserProfile } from './user-profile.entity';
import { Property } from './property.entity';
import { Lease } from './lease.entity';

@Entity({ schema: 'kdo' })
@Index('idx_notifications_user_read', ['userId', 'isRead'])
export class Notifications {
	@CreateDateColumn()
	createdAt: Date;

	@Column('jsonb', { nullable: true })
	data: Record<string, any>;

	@Index('idx_notification_delivered_at')
	@Column({ type: 'timestamp without time zone', nullable: true })
	deliveredAt: Date;

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'boolean', default: false, nullable: true })
	isDelivered: boolean;

	@Index('idx_notification_is_read')
	@Column({ type: 'boolean', default: false, nullable: true })
	isRead: boolean;

	@Column()
	leaseId: number;

	@Column({ type: 'text' })
	message: string;

	@Column()
	@Index('idx_notification_organization_uuid')
	organizationUuid?: string;

	@Column()
	propertyId: string;

	@Column({ type: 'timestamp without time zone', nullable: true })
	readAt: Date;

	@Column({ type: 'varchar' })
	title: string;

	@Index('idx_notification_type')
	@Column({ type: 'varchar' })
	type: string;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column()
	unitId: number;

	@Column()
	@Index('idx_notification_user_id')
	userId: string;

	@ManyToOne(() => Organization)
	@JoinColumn({ name: 'organizationUuid' })
	organization?: Organization;

	@ManyToOne(() => Unit)
	@JoinColumn({ name: 'unitId' })
	unit?: Unit;

	@ManyToOne(() => UserProfile)
	@JoinColumn({ name: 'userId', referencedColumnName: 'firebaseId' })
	user?: UserProfile;

	@ManyToOne(() => Property)
	@JoinColumn({ name: 'propertyId' })
	property?: Property;

	@ManyToOne(() => Lease)
	@JoinColumn({ name: 'leaseId' })
	lease?: Lease;
}
