import { NestFactory } from '@nestjs/core';
import { RentalsModule } from './rentals.module';

async function bootstrap() {
  const app = await NestFactory.create(RentalsModule);
  await app.listen(3000);
}
bootstrap();
