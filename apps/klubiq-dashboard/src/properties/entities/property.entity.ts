import { AutoMap } from '@automapper/classes';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Generated,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'poo' })
export class Property {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	uuid?: string;

	@AutoMap()
	@Index()
	@Generated('increment')
	@Column({ unique: true })
	id?: number;

	@AutoMap()
	@Column({ length: 100 })
	name: string;

	@AutoMap()
	@Column({ length: 100 })
	category: string;

	@AutoMap()
	@Column({ length: 100 })
	type: string;

	@AutoMap()
	@Column({ length: 100 })
	status: string;

	@DeleteDateColumn()
	deletedDate?: Date;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;
}
