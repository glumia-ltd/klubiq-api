import { HttpException, HttpStatus } from '@nestjs/common';

export class RequiredArgumentException extends HttpException {
	constructor(args: string[]) {
		super(
			`The following arguments: ${args.join(', ')} are required but were not provided`,
			HttpStatus.BAD_REQUEST,
		);
	}
}
