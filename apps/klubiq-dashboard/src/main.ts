import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { KlubiqDashboardModule } from './klubiq-dashboard.module';

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
    .build();
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
