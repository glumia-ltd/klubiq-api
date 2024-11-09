import { repl } from '@nestjs/core';
import { KlubiqDashboardModule } from './klubiq-dashboard.module';

async function bootstrap() {
	const replServer = await repl(KlubiqDashboardModule);
	replServer.setupHistory('.nestjs_repl_history', (err) => {
		if (err) console.error(err);
	});
}
bootstrap();
