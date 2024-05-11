import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import {
	SwaggerModule,
	DocumentBuilder,
	SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { KlubiqDashboardModule } from './klubiq-dashboard.module';
import { HttpExceptionFilter } from '@app/common';
import { HttpResponseInterceptor } from '@app/common';
import { CustomLogging } from '@app/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

declare const module: any;

async function bootstrap() {
	const customLogger = new CustomLogging(new ConfigService()); // Create an instance of ConfigService

	const app = await NestFactory.create(KlubiqDashboardModule, {
		logger: WinstonModule.createLogger(customLogger.createLoggerConfig),
	});

	app.setGlobalPrefix('/api');
	app.use(helmet());
	/// SWAGGER CONFIGURATION
	const options: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
	};
	const config = new DocumentBuilder()
		.setTitle('Klubiq PMS')
		.setDescription('Klubiq PMS API')
		.setVersion('1.0')
		.addTag('Klubiq')
		.setContact('Glumia Support', 'glumia.ng', 'info@glumia.ng')
		.setLicense('MIT', 'https://mit-license.org/')
		.addBearerAuth()
		.addSecurity('ApiKey', {
			type: 'apiKey',
			in: 'header',
			name: 'Authorization',
			scheme: 'ApiKeyAuth',
		})
		//.addServer('/api')
		.build();
	const document = SwaggerModule.createDocument(app, config, options);
	SwaggerModule.setup('swagger', app, document);
	/// END SWAGGER CONFIGURATION

	/// APP SETTINGS
	app.enableCors({
		// origin: ['http://localhost', '/.klubiq.com$/'],
		origin: true,
		optionsSuccessStatus: 204,
	});

	app.enableVersioning({
		type: VersioningType.URI,
	});
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalInterceptors(new HttpResponseInterceptor());
	await app.listen(3000);

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
}
bootstrap();
