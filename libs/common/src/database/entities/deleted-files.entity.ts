import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('deleted_files_records')
export class DeletedFilesRecords {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	url: string;

	@Column()
	externalId: string;

	@Column()
	deletedAt: Date;
}
