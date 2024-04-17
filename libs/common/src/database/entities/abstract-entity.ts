import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';
import {
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
	@AutoMap()
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
