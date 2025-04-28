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
import { AutoMap } from '@automapper/classes';
import { UserProfile } from './user-profile.entity';
import { Lease } from './lease.entity';
import { OrganizationTenants } from './organization-tenants.entity';
import { OrganizationRole } from './organization-role.entity';
import { LeasesTenants } from './leases-tenants.entity';

@Entity({ schema: 'kdo' })
export class TenantUser {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@AutoMap()
	@Column({ type: 'varchar', length: 255, unique: true, nullable: true })
	companyName?: string;

	@Column({ default: true })
	@Index('IDX_TENANT_USER_ACTIVE')
	isActive?: boolean;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	notes?: string;

	@AutoMap(() => UserProfile)
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

	@AutoMap(() => [Lease])
	@OneToMany(() => LeasesTenants, (leasesTenants) => leasesTenants.tenant)
	leases?: Lease[];

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
