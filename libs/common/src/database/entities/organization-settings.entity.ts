import { Entity } from 'typeorm/decorator/entity/Entity';
import { AbstractEntity } from './abstract-entity';
import {
	Column,
	CreateDateColumn,
	Index,
	JoinColumn,
	OneToOne,
	UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity({ schema: 'kdo' })
export class OrganizationSettings extends AbstractEntity {
	@Column('jsonb', { nullable: true })
	settings: Record<string, any>;

	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt?: Date;

	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updatedAt?: Date;

	@OneToOne(() => Organization, (organization) => organization.settings)
	@Index()
	@JoinColumn()
	organization?: Organization;
}
