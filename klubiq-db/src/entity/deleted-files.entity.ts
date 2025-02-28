import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity({ schema: 'kdo' })
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
