import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';
import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class AbstractEntity {
	@AutoMap()
	@PrimaryGeneratedColumn()
	@Exclude()
	public id?: number;
}
