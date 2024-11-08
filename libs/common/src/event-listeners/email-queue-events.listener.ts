//import { NotificationsService } from '@app/notifications';
import {
	QueueEventsHost,
	QueueEventsListener,
	OnQueueEvent,
} from '@nestjs/bullmq';
@QueueEventsListener('email')
export class EmailQueueEventListener extends QueueEventsHost {
	@OnQueueEvent('completed')
	async onCompleted(job: { jobId: string; result: any }) {
		console.log('Job completed', job);
	}

	@OnQueueEvent('failed')
	async onFailed(job: { jobId: string; result: any }) {
		console.log('Job failed', job);
	}
}
