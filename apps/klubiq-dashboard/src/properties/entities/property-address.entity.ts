import { AbstractEntity } from '@app/common';
import { AutoMap } from '@automapper/classes';
import { Column, DeleteDateColumn, Entity } from 'typeorm';

@Entity({ schema: 'poo' })
export class PropertyAddress extends AbstractEntity {
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
