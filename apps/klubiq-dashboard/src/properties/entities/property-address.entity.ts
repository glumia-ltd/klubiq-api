import { AutoMap } from '@automapper/classes';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ schema: 'poo' })
export class PropertyAddress {
	@AutoMap()
	@PrimaryGeneratedColumn()
	public id?: number;

	@CreateDateColumn()
	@Exclude()
	createdDate?: Date;

	@UpdateDateColumn()
	@Exclude()
	updatedDate?: Date;

	@AutoMap()
	@Column({ length: 100 })
	addressLine1: string;

	@AutoMap()
	@Column({ length: 100, default: '', nullable: true })
	addressLine2?: string;

	@AutoMap()
	@Column({ length: 50, nullable: true })
	city?: string;

	@AutoMap()
	@Column({ length: 50, nullable: true })
	state?: string;

	@AutoMap()
	@Column({ length: 20, nullable: true })
	postalCode?: string;

	@AutoMap()
	@Column({ length: 50 })
	country: string;

	@AutoMap()
	@Column()
	isManualAddress: boolean;

	@AutoMap()
	@Column({ type: 'decimal', nullable: true })
	latitude?: number;

	@AutoMap()
	@Column({ type: 'decimal', nullable: true })
	longitude?: number;

	@DeleteDateColumn()
	deletedDate?: Date;
}
