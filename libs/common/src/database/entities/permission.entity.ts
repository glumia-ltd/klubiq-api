import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToMany,
	JoinTable
} from 'typeorm';
import { Role } from './role.entity';

@Entity({ schema: 'klubiq' })
export class Permission {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	permissionName: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
	@JoinTable()
	roles: Role[];
}
