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
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { UserProfile } from './user-profile.entity';
import { Lease } from './lease.entity';

@Entity({ schema: 'kdo' })
export class TenantUser {
	@AutoMap()
	@PrimaryGeneratedColumn({ type: 'bigint' })
	id?: number;

	@AutoMap()
	@Column({ type: 'varchar', length: 50, nullable: true })
	title?: string;

	@AutoMap()
	@Index()
	@Column({ unique: true })
	email: string;

	@AutoMap()
	@Column({ type: 'varchar', length: 255, nullable: true })
	firstName?: string;

	@AutoMap()
	@Column({ type: 'varchar', length: 255, nullable: true })
	lastName?: string;

	@AutoMap()
	@Column({ type: 'varchar', length: 255, unique: true, nullable: true })
	companyName?: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	notes?: string;

	@AutoMap(() => UserProfile)
	@OneToOne(() => UserProfile, {
		cascade: ['remove', 'update'],
		nullable: true,
	})
	@JoinColumn({
		name: 'profileUuid',
		referencedColumnName: 'profileUuid',
	})
	profile?: UserProfile;

	@AutoMap(() => [Lease])
	@ManyToMany(() => Lease, (lease) => lease.tenants)
	leases?: Lease[];

	@AutoMap()
	@Column({ nullable: true })
	dateOfBirth?: Date;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
