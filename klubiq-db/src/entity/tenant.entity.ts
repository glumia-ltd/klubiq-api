import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	JoinColumn,
	OneToOne,
	ManyToMany,
	UpdateDateColumn,
	CreateDateColumn,
	Index,
	OneToMany,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Lease } from './lease.entity';
import { OrganizationTenants } from './organization-tenants.entity';

@Entity({ schema: 'kdo' })
export class TenantUser {
	
	@PrimaryGeneratedColumn({ type: 'bigint' })
	id?: number;

	
	@Column({ type: 'varchar', length: 50, nullable: true })
	title?: string;

	
	@Index()
	@Column({ unique: true })
	email?: string;

	
	@Column({ type: 'varchar', length: 255, nullable: true })
	firstName?: string;

	
	@Column({ type: 'varchar', length: 255, nullable: true })
	lastName?: string;

	
	@Column({ type: 'varchar', length: 255, unique: true, nullable: true })
	companyName?: string;

	
	@Column({ type: 'text', nullable: true })
	notes?: string;

	@OneToOne(() => UserProfile, {
		cascade: ['remove', 'update'],
		nullable: true,
	})
	@JoinColumn({
		name: 'profileUuid',
		referencedColumnName: 'profileUuid',
	})
	profile?: UserProfile;

	@ManyToMany(() => Lease, (lease) => lease.tenants)
	leases?: Lease[];

	
	@Column({ nullable: true })
	dateOfBirth?: Date;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdDate?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedDate?: Date;

	@OneToMany(
		() => OrganizationTenants,
		(organizationTenant) => organizationTenant.tenant,
	)
	organizationTenants?: OrganizationTenants[];
}
