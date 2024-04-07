import { Exclude } from 'class-transformer';
import {
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
	@PrimaryGeneratedColumn()
	@Exclude()
	public id: number;

	@CreateDateColumn()
	@Exclude()
	createdDate?: Date;

	@UpdateDateColumn()
	@Exclude()
	updatedDate?: Date;
}
