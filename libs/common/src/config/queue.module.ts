import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
//import { PropertyEventsListener } from '../event-listeners/property-events.listener';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),

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
	],
	exports: [BullModule],
	//providers: [],
})
export class QueueModule {}
