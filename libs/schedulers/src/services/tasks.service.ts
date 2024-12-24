import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class TasksService {
	constructor(private readonly entityManager: EntityManager) {}

	async getDeletedFilesCount() {
		return await this.entityManager
			.createQueryBuilder(PropertyImage, 'pi')
			.where('pi.isArchived = :isArchived', { isArchived: true })
			.andWhere('pi.fileSize = :fileSize', { fileSize: 0 })
			.getCount();
	}
	async getDeletedFilesRecord(page: number) {
		const result = await this.entityManager
			.createQueryBuilder(PropertyImage, 'pi')
			.select('pi.externalId')
			.where('pi.isArchived = :isArchived', { isArchived: true })
			.andWhere('pi.fileSize = :fileSize', { fileSize: 0 })
			.skip(page - 1)
			.take(100)
			.getRawMany();
		return result;
	}

	async deleteRecords() {
		await this.entityManager
			.createQueryBuilder()
			.delete()
			.from(PropertyImage)
			.where('isArchived = :isArchived', { isArchived: true })
			.andWhere('fileSize = :fileSize', { fileSize: 0 })
			.execute();
	}
}
