import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ClsServiceManager } from 'nestjs-cls';
import { StatusCodeToKlubiqErrorCode } from '../config/error.constant';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
	implements ExceptionFilter
{
	private readonly logger = new Logger(HttpExceptionFilter.name);
	private readonly cls = ClsServiceManager.getClsService();
	async catch(exception: T, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();
		const exceptionResponse = exception.getResponse();
		const errCustomCode = StatusCodeToKlubiqErrorCode[status] ?? 'K30000';
		const error =
			typeof exceptionResponse === 'string'
				? { message: exceptionResponse }
				: (exceptionResponse as object);
		this.logger.log({
			level: 'error',
			message: exceptionResponse.toString(),
			error,
			klubiqCode: errCustomCode,
			status,
			requestId: this.cls.getId(),
			stack: exception.stack,
		});
		response
			.status(status)
			.json({ ...error, status, timestamp: new Date().toISOString() });
	}
}
