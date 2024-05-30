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

	@CreateDateColumn({ select: false })
	@Exclude()
	createdDate?: Date;

	@UpdateDateColumn({ select: false })
	@Exclude()
	updatedDate?: Date;

	@AutoMap()
	@Column({ length: 100 })
	addressLine1: string;

	@AutoMap()
	@Column({ length: 100, nullable: true })
	unit?: string;

	@AutoMap()
	@Column({ length: 100, nullable: true })
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
	@Column({ default: false })
	isManualAddress: boolean;

	@AutoMap()
	@Column({ type: 'decimal', nullable: true })
	latitude?: number;

	@AutoMap()
	@Column({ type: 'decimal', nullable: true })
	longitude?: number;

	@DeleteDateColumn({ select: false })
	deletedDate?: Date;
}
