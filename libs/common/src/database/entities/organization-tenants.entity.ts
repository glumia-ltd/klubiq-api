import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { TenantUser } from './tenant.entity';

@Entity({ schema: 'poo' })
export class OrganizationTenants {
	@PrimaryGeneratedColumn('uuid')
	uuid: string;

	@Column()
	@Index('IDX_OT_TENANT_ID')
	tenantId: number;

	@Column()
	@Index('IDX_OT_ORGANIZATION_UUID')
	organizationUuid: string;

	@ManyToOne(
		() => Organization,
		(organization) => organization.organizationTenants,
		{
			lazy: false,
			onDelete: 'CASCADE',
		},
	)
	@JoinColumn({ name: 'organizationUuid' })
	organization?: Organization;

	@ManyToOne(() => TenantUser, (tenant) => tenant.organizationTenants, {
		lazy: true,
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'tenantId' })
	tenant?: TenantUser;
}
