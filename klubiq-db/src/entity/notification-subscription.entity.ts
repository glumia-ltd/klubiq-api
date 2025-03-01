import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Organization } from './organization.entity';

@Entity({ schema: 'kdo' })
export class NotificationSubscription {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index('idx_user_notification_subscription_ID')
	@Column()
	userId?: string;

	@Column('jsonb')
	subscription: Record<string, any>;

	@Column()
	@Index('idx_organization_notification_subscription_uuid')
	organizationUuid?: string;

	@OneToOne(() => UserProfile, (user) => user.notificationSubscription)
	@JoinColumn({ name: 'userId', referencedColumnName: 'profileUuid' })
	user: UserProfile;

	@ManyToOne(() => Organization, (organization) => organization.subscriptions, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'organizationUuid' })
	organization?: Organization;

	@CreateDateColumn({
		type: 'timestamptz',
		select: false,
		default: () => 'NOW()',
	})
	createdAt: Date;

	@UpdateDateColumn({
		type: 'timestamptz',
		select: false,
		default: () => 'NOW()',
	})
	updatedAt: Date;
}
