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
	public id: number;

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
	@Column({ length: 100, default: '' })
	addressLine2: string;

	@AutoMap()
	@Column({ length: 50 })
	city: string;

	@AutoMap()
	@Column({ length: 50 })
	state: string;

	@AutoMap()
	@Column({ length: 20 })
	postalCode: string;

	@AutoMap()
	@Column({ length: 50 })
	country: string;

	@AutoMap()
	@Column()
	isManualAddress: boolean;

	@AutoMap()
	@Column({ type: 'decimal' })
	latitude: number;

	@AutoMap()
	@Column({ type: 'decimal' })
	longitude: number;

	@DeleteDateColumn()
	deletedDate?: Date;
}
