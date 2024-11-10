import { NotificationsService } from '@app/notifications/services/notifications.service';
import {
	QueueEventsHost,
	QueueEventsListener,
	OnQueueEvent,
} from '@nestjs/bullmq';
@QueueEventsListener('notification')
export class NotificationQueueListener extends QueueEventsHost {
	constructor(private readonly notificationsService: NotificationsService) {
		super();
	}
	// @OnQueueEvent('completed')
	// async onCompleted(jobId: string) {

	// 	if (job.returnvalue?.notificationIds) {

	// 		this.notificationsService.markAsReadOrDelivered(job.returnvalue.notificationIds, true, false);
	// 	}
	// }

	@OnQueueEvent('failed')
	async onFailed(job: { jobId: string; result: any }) {
		console.log('Job failed', job);
	}
}
