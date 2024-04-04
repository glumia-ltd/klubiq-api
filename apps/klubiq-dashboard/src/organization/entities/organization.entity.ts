import {
	Entity,
	PrimaryGeneratedColumn,
	DeleteDateColumn,
	Column,
	Generated,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
} from 'typeorm';
import { OrganizationUser } from '../../users/entities/organization-user.entity';
import { AutoMap } from '@automapper/classes';

@Entity({ schema: 'poo' })
export class Organization {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	organizationUuid?: string;

	@AutoMap()
	@Index()
	@Generated('increment')
	@Column({ unique: true })
	organizationId?: number;

	@AutoMap()
	@Column({ default: true })
	isActive?: boolean;

	@AutoMap()
	@Index()
	@Column({ length: 100, unique: true })
	name: string;

	@AutoMap()
	@Column({ default: false })
	isVerified?: boolean;

	@AutoMap()
	@Column({ nullable: true })
	email?: string;

	@AutoMap()
	@Column({ nullable: true })
	govRegistrationNumber?: string;

	@AutoMap()
	@Column({ nullable: true })
	countryPhoneCode?: string;

	@AutoMap()
	@Column({ nullable: true })
	phoneNumber?: string;

	@AutoMap()
	@Column({ nullable: true })
	street?: string;

	@AutoMap()
	@Column({ nullable: true })
	addressLine2?: string;

	@AutoMap()
	@Column({ nullable: true })
	state?: string;

	@AutoMap()
	@Column({ nullable: true })
	city?: string;

	@AutoMap()
	@Column({ nullable: true })
	country?: string;

	@AutoMap()
	@Column({ nullable: true })
	postalCode?: string;

	@AutoMap()
	@Column({ nullable: true })
	companyType?: string;

	@Column({ default: false })
	isDeleted?: boolean;

	@AutoMap(() => [OrganizationUser])
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

	@AutoMap()
	@Column({ nullable: true })
	website?: string;
}
