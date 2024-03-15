import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
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
		const error =
			typeof response === 'string'
				? { message: exceptionResponse }
				: (exceptionResponse as object);
		this.logger.log({
			level: 'error',
			message: exceptionResponse.toString,
			err: error,
			errCustomCode: 'k100',
		});
		response
			.status(status)
			.json({ ...error, timestamp: new Date().toISOString() });
	}
}
