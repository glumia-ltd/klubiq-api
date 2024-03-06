import { Injectable } from '@nestjs/common';

@Injectable()
export class KlubiqDashboardService {
	getHello(): string {
		return 'Hello World!';
	}
}
