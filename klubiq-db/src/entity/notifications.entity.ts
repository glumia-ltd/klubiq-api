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
import { NotificationPriority } from '../types/enums';

@Entity({ schema: 'kdo' })
@Index('idx_notifications_user_read', ['userId', 'isRead'])
export class Notifications {
	@Column({ nullable: true })
	actionLink: string;

	@Column({ nullable: true })
	actionText: string;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@Column('jsonb', { nullable: true })
	data: Record<string, any>;

	@Index('idx_notification_delivered_at')
	@Column({ type: 'timestamp with time zone', nullable: true })
	deliveredAt: Date;

	@Column({ type: 'timestamp with time zone', nullable: true })
	expiresAt: Date;

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'boolean', default: false, nullable: true })
	isDelivered: boolean;

	@Index('idx_notification_is_read')
	@Column({ type: 'boolean', default: false, nullable: true })
	isRead: boolean;

	@Column({ nullable: true })
	leaseId: string;

	@Column({ type: 'text' })
	message: string;

	@Column()
	@Index('idx_notification_organization_uuid')
	organizationUuid?: string;

	@Column({ nullable: true })
	propertyId: string;

	@Column({
		type: 'enum',
		enum: NotificationPriority,
		default: NotificationPriority.LOW,
	})
	priority?: NotificationPriority;

	@Column({ type: 'timestamp with time zone', nullable: true })
	readAt: Date;

	@Column({ type: 'varchar' })
	title: string;

	@Index('idx_notification_type')
	@Column({ type: 'varchar' })
	type: string;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedAt: Date;

	@Column({ nullable: true })
	unitId: string;

	@Column({ nullable: true })
	@Index('idx_notification_user_id')
	userId: string;

	@ManyToOne(() => Organization, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'organizationUuid' })
	organization?: Organization;

	@ManyToOne(() => Unit, {
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'unitId' })
	unit?: Unit;

	@ManyToOne(() => UserProfile, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'userId', referencedColumnName: 'profileUuid' })
	user?: UserProfile;

	@ManyToOne(() => Property, {
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'propertyId' })
	property?: Property;

	@ManyToOne(() => Lease, {
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'leaseId' })
	lease?: Lease;

	@Index('idx_notification_is_announcement')
	@Column({ type: 'boolean', default: false, nullable: true })
	isAnnouncement: boolean;
}
