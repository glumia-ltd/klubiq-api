import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class TasksService {
	constructor(private readonly entityManager: EntityManager) {}

	async getDeletedFilesCount() {
		return await this.entityManager
			.createQueryBuilder('deleted_files_records', 'dfr')
			.getCount();
	}
	async getDeletedFilesRecord(page: number) {
		const query = await this.entityManager
			.createQueryBuilder('deleted_files_records', 'dfr')
			.select('dfr.externalId')
			.skip(page - 1)
			.take(100)
			.getRawMany();
		return query;
	}

	async deleteRecords() {
		const query = await this.entityManager
			.createQueryBuilder('deleted_files_records', 'dfr')
			.delete()
			//.where('dfr.externalId IN (:...externalIds)', { externalIds })
			.execute();
		return query;
	}
}
