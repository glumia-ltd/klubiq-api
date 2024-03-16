import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';

@Entity({ schema: 'kdo' })
export class Role {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column({ length: 255, unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@OneToMany(() => UserProfile, (userProfile) => userProfile.systemRole)
	users?: UserProfile[];

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
