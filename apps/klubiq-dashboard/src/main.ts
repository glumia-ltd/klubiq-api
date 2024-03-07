import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { KlubiqDashboardModule } from './klubiq-dashboard.module';

async function bootstrap() {
  const app = await NestFactory.create(KlubiqDashboardModule);

  const config = new DocumentBuilder()
    .setTitle('Klubiq PMS')
    .setDescription('Klubiq PMS API')
    .setVersion('1.0')
    .addTag('klubiq')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
