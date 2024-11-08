import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerSendService } from '@app/common/email/email.service';
import { EmailProcessor } from './processors/email.processor';

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
			name: 'email',
		}),
	],
	providers: [MailerSendService, ConfigService, EmailProcessor],
})
export class KlubiqQueueModule {}
