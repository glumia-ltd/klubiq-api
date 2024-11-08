import { Injectable } from '@nestjs/common';

@Injectable()
export class KlubiqQueueService {
	getHello(): string {
		return 'Hello World!';
	}
}
