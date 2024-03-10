import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToMany,
} from 'typeorm';
import { Permission } from './permission.entity';
import { UserProfile } from './user-profile.entity';

@Entity({ schema: 'klubiq' })
export class Role {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	roleName: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@ManyToMany(() => Permission, (permission) => permission.roles)
	permissions?: Permission[];

	@ManyToMany(() => UserProfile, (userProfile) => userProfile.roles)
	users?: UserProfile[];

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
