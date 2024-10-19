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
	userId: string;

	@Column('jsonb')
	subscription: Record<string, any>;

	@Column()
	@Index('idx_organization_notification_subscription_uuid')
	organizationUuid?: string;

	@OneToOne(() => UserProfile)
	@JoinColumn({ name: 'userId', referencedColumnName: 'firebaseId' })
	user: UserProfile;

	@ManyToOne(() => Organization, (organization) => organization.subscriptions)
	@JoinColumn({ name: 'organizationUuid' })
	organization?: Organization;

	@CreateDateColumn({ select: false })
	createdAt: Date;

	@UpdateDateColumn({ select: false })
	updatedAt: Date;
}
