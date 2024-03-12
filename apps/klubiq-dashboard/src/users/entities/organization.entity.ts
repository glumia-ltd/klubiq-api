import {
	Entity,
	PrimaryGeneratedColumn,
	DeleteDateColumn,
	Column,
	Generated,
	OneToMany,
  CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { OrganizationUser } from './organization-user.entity';

@Entity({ schema: 'poo' })
@Entity()
export class Organization {
@PrimaryGeneratedColumn('uuid')
	organizationUuid?: string;

	@Generated('increment')
	@Column({ unique: true })
	organizationId?: number;

	@Column({ default: true })
	isActive?: boolean;

	@Column({ length: 100 })
	name: string;

	@Column({ default: false })
	isDeleted?: boolean;

	@OneToMany(() => OrganizationUser, (orgUser) => orgUser.organization)
	users?: OrganizationUser[];

	@DeleteDateColumn()
	deletedDate?: Date;

  @CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;

}