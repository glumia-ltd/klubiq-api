import { HttpException, HttpStatus } from '@nestjs/common';

export class FirebaseException extends HttpException {
	constructor(message: string) {
		super(message, HttpStatus.FAILED_DEPENDENCY);
	}
}
