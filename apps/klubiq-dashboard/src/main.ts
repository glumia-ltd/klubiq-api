import { NestFactory } from '@nestjs/core';
import {
	SwaggerModule,
	DocumentBuilder,
	SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { KlubiqDashboardModule } from './klubiq-dashboard.module';

declare const module: any;
async function bootstrap() {
	const app = await NestFactory.create(KlubiqDashboardModule);

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
	await app.listen(3000);

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
}
bootstrap();
