import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { CustomLogging } from '@app/common/config/custom-logging';
import { WinstonModule } from 'nest-winston';
import { KlubiqQueueModule } from './klubiq-queue.module';

async function bootstrap() {
	const customLogger = new CustomLogging(new ConfigService()); // Create an instance of ConfigService
	const app = await NestFactory.create(KlubiqQueueModule, {
		logger: WinstonModule.createLogger(customLogger.createLoggerConfig),
	});
	const configService = app.get(ConfigService);
	await app.listen(configService.get('WORKER_PORT') || 3001);
}

bootstrap();
