import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	JoinColumn,
	OneToOne,
	UpdateDateColumn,
	CreateDateColumn,
	Index,
	OneToMany,
	ManyToOne,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Lease } from './lease.entity';
import { OrganizationTenants } from './organization-tenants.entity';
import { OrganizationRole } from './organization-role.entity';
import { LeasesTenants } from './leases-tenants';

@Entity({ schema: 'kdo' })
export class TenantUser {
	
	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@Column({ type: 'varchar', length: 255, unique: true, nullable: true })
	companyName?: string;

	@Column({ default: true })
	@Index('IDX_TENANT_USER_ACTIVE')
	isActive?: boolean;


	@Column({ type: 'text', nullable: true })
	notes?: string;

	@OneToOne(() => UserProfile, {
		cascade: ['remove', 'update'],
		nullable: true,
		lazy: true,
	})
	@JoinColumn({
		name: 'profileUuid',
		referencedColumnName: 'profileUuid',
	})
	profile?: Promise<UserProfile>;


	@OneToMany(() => LeasesTenants, (leasesTenants) => leasesTenants.tenant)
	leasesTenants?: LeasesTenants[];


	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdDate?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedDate?: Date;

	@OneToMany(
		() => OrganizationTenants,
		(organizationTenant) => organizationTenant.tenant,
	)
	organizationTenants?: OrganizationTenants[];

	@ManyToOne(() => OrganizationRole, { eager: true, onDelete: 'RESTRICT' })
	@JoinColumn({
		name: 'roleId',
		referencedColumnName: 'id',
	})
	@Index('IDX_TENANT_USER_ROLE')
	role?: OrganizationRole;
}
