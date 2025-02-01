import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { postJobAction } from './job-constants';
import axios from 'axios';

@Processor('notification-results')
export class JobResultsProcessor extends WorkerHost {
	private readonly logger = new Logger(JobResultsProcessor.name);
	private readonly APIPort: number;
	constructor(private readonly configService: ConfigService) {
		super();
		this.APIPort = this.configService.get<number>('APP_PORT');
	}
	async process(job: Job<any, any, any>): Promise<any> {
		const { action, notificationIds } = job.data;
		switch (action) {
			case postJobAction.MARK_AS_DELIVERED:
				if (notificationIds && notificationIds.length > 0) {
					await this.markAsDelivered(notificationIds);
				}
				break;
			case postJobAction.SEND_PUSH_NOTIFICATION:
				this.logger.log(
					`Job ${job.id} is being processed for action: ${action}`,
				);
				break;
			case postJobAction.CREATE_NOTIFICATION:
				this.logger.log(
					`Job ${job.id} is being processed for action: ${action}`,
				);
				break;
			default:
				break;
		}
	}

	@OnWorkerEvent('completed')
	onJobCompleted(jobId: string, result: any) {
		this.logger.log(`Job ${jobId} completed with result: ${result}`);
		return { jobId, result };
	}

	@OnWorkerEvent('active')
	onJobActive(jobId: string) {
		this.logger.log(`Job ${jobId} is active`);
	}

	@OnWorkerEvent('failed')
	onJobFailed(jobId: string, failedReason: any) {
		this.logger.error(
			`Job ${jobId} failed with reason: ${JSON.stringify(failedReason)}`,
		);
		return { jobId, failedReason };
	}

	async markAsDelivered(notificationIds: number[]) {
		try {
			await axios.patch(
				`http://localhost:${this.APIPort}/api/notifications/mark-as-read-or-delivered`,
				{ notificationIds, isRead: false, isDelivered: true },
			);
			console.log(`Marked notifications as delivered: ${notificationIds}`);
		} catch (error) {
			this.logger.error(`Error marking notifications as delivered: ${error}`);
			return null;
		}
	}
}
