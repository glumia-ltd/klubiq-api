import { Module } from '@nestjs/common';
import { SchedulersService } from './services/schedulers.service';
import { ScheduleModule } from '@nestjs/schedule';
import { FileUploadService } from '@app/common/services/file-upload.service';
import { TasksService } from './services/tasks.service';
import { SubscriptionModule } from '@app/common/public/subscription/subscription.module';

@Module({
	imports: [ScheduleModule.forRoot(), SubscriptionModule],
	providers: [SchedulersService, FileUploadService, TasksService],
	exports: [SchedulersService],
})
export class SchedulersModule {}
