import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
  ManyToMany,
  OneToOne
} from 'typeorm';
import { Role } from './role.entity';
import { User } from '../../../../../apps/klubiq-dashboard/src/users/entities/user.entity';

@Entity({ schema: 'klubiq' })
export class UserProfile {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 100 })
	firstName: string;

	@Column({ length: 100 })
	lastName: string;

	@Column({ length: 100 })
	username: string;

	@Column({ unique: true })
	email: string;

	@Column({ nullable: true })
	phoneNumber: string;

	@Column({ nullable: true })
	countryPhoneCode: string;

	@Column({ nullable: true })
	street: string;

	@Column({ nullable: true })
	addressLine2: string;

	@Column({ nullable: true })
	state: string;

	@Column({ nullable: true })
	city: string;

	@Column({ nullable: true })
	country: string;

	@Column({ nullable: true })
	postalCode: string;

	@Column({ nullable: true })
	formOfIdentity: string;

	@Column({ nullable: true })
	dateOfBirth: Date;

	@Column({ nullable: true })
	gender: string;

	@Column({ nullable: true })
	maritalStatus: string;

	@Column({ nullable: true })
	familySize: number;

	@Column({ nullable: true })
	employmentStatus: string;

	@Column({ nullable: true })
	occupation: string;

	@Column({ nullable: true })
	religion: string;

	@Column({ type: 'text', nullable: true })
	bio: string;

  @ManyToMany(() => Role, (role) => role.users)
  roles: Role[];

  @OneToOne(() => User, (dashboardUser) => dashboardUser.profile)
  dashboardUser: User;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;
}
