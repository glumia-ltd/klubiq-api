import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import {
	SwaggerModule,
	DocumentBuilder,
	SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { KlubiqDashboardModule } from './klubiq-dashboard.module';
import { HttpExceptionFilter } from '@app/common';
import { HttpResponseInterceptor } from '@app/common';
import { CustomLogging } from '@app/common';

declare const module: any;

async function bootstrap() {
	///CUSTOM LOGGER SERVICE
	const customLogger = new CustomLogging();

	const app = await NestFactory.create(KlubiqDashboardModule, {
		logger: WinstonModule.createLogger(customLogger.createLoggerConfig),
	});

	/// SWAGGER CONFIGURATION
	const options: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
	};
	const config = new DocumentBuilder()
		.setTitle('Klubiq PMS')
		.setDescription('Klubiq PMS API')
		.setVersion('1.0')
		.addTag('klubiq')
		.setContact('Glumia Support', 'glumia.ng', 'info@glumia.ng')
		.setLicense('MIT', 'https://mit-license.org/')
		// .addServer('XXXXXXXXXXXXXXXXXXXXX')
		.build();
	const document = SwaggerModule.createDocument(app, config, options);
	SwaggerModule.setup('api', app, document);
	/// END SWAGGER CONFIGURATION

	/// APP SETTINGS
	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalInterceptors(new HttpResponseInterceptor());
	await app.listen(3000);

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
}
bootstrap();
