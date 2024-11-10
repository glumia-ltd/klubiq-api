import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerSendService } from '@app/common/email/email.service';
import { NotificationProcessor } from './processors/notification.processor';
import { JobResultsProcessor } from './processors/job-results.processor';
// import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				connection: {
					host: 'localhost',
					port: configService.get('REDIS_PORT'),
				},
			}),
		}),
		BullModule.registerQueue(
			{
				name: 'notification',
			},
			{
				name: 'notification-results',
			},
		),

		// DevtoolsModule.registerAsync({
		// 	useFactory: () => ({
		// 		http: process.env.NODE_ENV !== 'production',
		// 	}),
		// }),
	],
	providers: [
		MailerSendService,
		ConfigService,
		NotificationProcessor,
		JobResultsProcessor,
	],
})
export class KlubiqQueueModule {}
