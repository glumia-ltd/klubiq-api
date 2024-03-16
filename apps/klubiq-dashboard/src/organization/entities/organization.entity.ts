import {
	Entity,
	PrimaryGeneratedColumn,
	DeleteDateColumn,
	Column,
	Generated,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
	Index
} from 'typeorm';
import { OrganizationUser } from '../../users/entities/organization-user.entity';

@Entity({ schema: 'poo' })
export class Organization {
	@PrimaryGeneratedColumn('uuid')
	organizationUuid?: string;

	@Index()
	@Generated('increment')
	@Column({ unique: true })
	organizationId?: number;

	@Column({ default: true })
	isActive?: boolean;

	@Index()
	@Column({ length: 100, unique: true })
	name: string;

	@Column({ default: false })
	isDeleted?: boolean;

	@OneToMany(() => OrganizationUser, (orgUser) => orgUser.organization, {
		cascade: true,
	})
	users?: OrganizationUser[];

	@DeleteDateColumn()
	deletedDate?: Date;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
