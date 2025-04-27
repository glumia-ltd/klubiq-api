import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'kdo' })
export class TenantInvitation {
	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@Index()
	@Column({ unique: true })
	firebaseUid: string;

	@Index()
	@Column({ type: 'uuid' })
	userId: string;

	@Column({ type: 'timestamptz' })
	invitedAt: string;

	@Column({ type: 'timestamptz', nullable: true })
	acceptedAt?: string;

	@Index('idx_tenant_invitation_token')
	@Column({ type: 'text' })
	token: string;
}
