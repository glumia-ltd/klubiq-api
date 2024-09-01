import { Entity } from 'typeorm/decorator/entity/Entity';
import { AbstractEntity } from './abstract-entity';
import {
	Column,
	CreateDateColumn,
	Index,
	JoinColumn,
	OneToOne,
	UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';

@Entity({ schema: 'kdo' })
export class UserPreferences extends AbstractEntity {
	@Column('jsonb', { nullable: true })
	preferences: Record<string, any>;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt?: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt?: Date;

	@OneToOne(() => UserProfile, (profile) => profile.preferences)
	@Index('IDX_USER_PREFERENCES_PROFILE')
	@JoinColumn({ name: 'userId', referencedColumnName: 'firebaseId' })
	profile?: UserProfile;
}
