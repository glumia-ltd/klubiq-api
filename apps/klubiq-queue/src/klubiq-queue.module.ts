import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerSendService } from '@app/common/email/email.service';
import { NotificationProcessor } from './processors/notification.processor';
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
		BullModule.registerQueue({
			name: 'notification',
		}),
		// DevtoolsModule.registerAsync({
		// 	useFactory: () => ({
		// 		http: process.env.NODE_ENV !== 'production',
		// 	}),
		// }),
	],
	providers: [MailerSendService, ConfigService, NotificationProcessor],
})
export class KlubiqQueueModule {}
