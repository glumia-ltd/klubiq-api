import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import {
	SwaggerModule,
	DocumentBuilder,
	SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { KlubiqDashboardModule } from './klubiq-dashboard.module';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { HttpResponseInterceptor } from '@app/common/interceptors/http-response.interceptor';
import { CustomLogging } from '@app/common/config/custom-logging';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';

declare const module: any;

async function bootstrap() {
	//await repl(KlubiqDashboardModule);

	const customLogger = new CustomLogging(new ConfigService()); // Create an instance of ConfigService

	const app = await NestFactory.create(KlubiqDashboardModule, {
		logger: WinstonModule.createLogger(customLogger.createLoggerConfig),
		snapshot: true,
	});
	const configService = app.get(ConfigService);
	app.use(helmet());
	app.use(
		session({
			secret: configService.get('APP_SECRET'),
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				secure: configService.get('NODE_ENV') !== 'local',
				maxAge: 1000 * 60 * 60 * 24 * 30,
			},
		}),
	);
	app.setGlobalPrefix('/api');
	/// SWAGGER CONFIGURATION
	const options: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
	};
	const config = new DocumentBuilder()
		.setTitle('Klubiq PMS')
		.setDescription('Klubiq PMS API')
		.setVersion('1.0')
		.addServer('http://localhost:3000/')
		.addServer('https://devapi.klubiq.com/')

		//.addTag('Klubiq')
		.setContact('Glumia Support', 'glumia.ng', 'info@glumia.ng')
		.addBearerAuth()
		.addSecurity('ApiKey', {
			type: 'apiKey',
			in: 'header',
			name: 'Authorization',
			scheme: 'ApiKeyAuth',
		})

		// TODO: Add OAuth2
		// .addOAuth2({
		// 	type: 'oauth2',
		// 	flows: {
		// 		implicit: {
		// 			authorizationUrl: 'https://auth.klubiq.com/oauth/authorize',
		// 			scopes: {
		// 				read: 'read',
		// 				write: 'write',
		// 			},
		// 		},
		// 	},
		// })
		//.addServer('/api')
		.build();
	const document = SwaggerModule.createDocument(app, config, options);
	SwaggerModule.setup('swagger', app, document);
	/// END SWAGGER CONFIGURATION

	/// APP SETTINGS
	app.enableCors({
		//origin: ['http://localhost', 'https://*.klubiq.com'],
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

	await app.listen(configService.get('APP_PORT') || 3000);

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
}
bootstrap();
