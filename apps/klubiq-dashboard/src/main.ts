import { NestFactory } from '@nestjs/core';
import { KlubiqDashboardModule } from './klubiq-dashboard.module';

async function bootstrap() {
	const app = await NestFactory.create(KlubiqDashboardModule);
	await app.listen(3000);
}
bootstrap();
