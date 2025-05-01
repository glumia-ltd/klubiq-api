import { ApiDebugger } from '@app/common/helpers/debug-loggers';
import { NotificationsService } from '@app/notifications/services/notifications.service';
import {
	QueueEventsHost,
	QueueEventsListener,
	OnQueueEvent,
} from '@nestjs/bullmq';
@QueueEventsListener('notification')
export class NotificationQueueListener extends QueueEventsHost {
	constructor(
		private readonly notificationsService: NotificationsService,
		private readonly apiDebugger: ApiDebugger,
	) {
		super();
	}

	// @OnQueueEvent('completed')
	// async onCompleted(job: { jobId: string; returnvalue: any }) {
	// 	if (job.returnvalue?.notificationIds) {
	// 		await this.notificationsService.markAsReadOrDelivered(job.returnvalue.notificationIds, true, false);
	// 	}
	// }

	@OnQueueEvent('failed')
	async onFailed(job: { jobId: string; result: any }) {
		this.apiDebugger.error('Job failed', job);
	}
}
