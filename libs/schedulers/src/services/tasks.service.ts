import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class TasksService {
	constructor(private readonly entityManager: EntityManager) {}

	getDeletedFilesQuery() {
		return this.entityManager
			.createQueryBuilder(PropertyImage, 'pi')
			.where('pi.isArchived = :isArchived', { isArchived: true })
			.andWhere('pi.fileSize = :fileSize', { fileSize: 0 });
	}
	async getDeletedFilesCount() {
		return await this.getDeletedFilesQuery().getCount();
	}
	async getDeletedFilesRecord(page: number) {
		const query = await this.getDeletedFilesQuery()
			.select('dfr.externalId')
			.skip(page - 1)
			.take(100)
			.getRawMany();
		return query;
	}

	async deleteRecords() {
		const query = await this.getDeletedFilesQuery().delete().execute();
		return query;
	}
}
