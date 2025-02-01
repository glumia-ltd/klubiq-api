import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { FileUploadService } from '@app/common/services/file-upload.service';

@Injectable()
export class SchedulersService {
	private readonly logger = new Logger(SchedulersService.name);
	constructor(
		private readonly tasksService: TasksService,
		private readonly fileService: FileUploadService,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleDeletedFilesRecords() {
		const total_deleted = await this.tasksService.getDeletedFilesCount();
		if (total_deleted > 0) {
			this.logger.debug(`Total deleted files records: ${total_deleted}`);
			for (let page = 1; page <= Math.ceil(total_deleted / 100); page++) {
				const deleted_files =
					await this.tasksService.getDeletedFilesRecord(page);
				const externalIds = deleted_files.map((file) => file.externalId);
				this.fileService.deleteFilesFromCloudinary(externalIds);
			}
			await this.tasksService.deleteRecords();
		}
	}

	@Cron(CronExpression.EVERY_10_MINUTES)
	async refreshLeasePaymentTotalView() {
		await this.tasksService.refreshLeasePaymentTotalView();
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async updateOrganizationCounter() {
		await this.tasksService.updateOrganizationCounters();
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async updateLeaseStatuses() {
		await this.tasksService.updateOrganizationCounters();
	}
}
