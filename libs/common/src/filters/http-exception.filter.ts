import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
	HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
	implements ExceptionFilter
{
	private readonly logger = new Logger(HttpExceptionFilter.name);
	async catch(exception: T, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();
		const exceptionResponse = exception.getResponse();
		const errCustomCode =
			status == HttpStatus.FAILED_DEPENDENCY ? 'K600' : 'K100';
		const error =
			typeof exceptionResponse === 'string'
				? { message: exceptionResponse }
				: (exceptionResponse as object);

		this.logger.log({
			level: 'error',
			message: exceptionResponse.toString,
			err: error,
			errCustomCode,
		});
		response
			.status(status)
			.json({ ...error, timestamp: new Date().toISOString() });
	}
}
