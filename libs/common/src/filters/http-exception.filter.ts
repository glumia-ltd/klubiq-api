import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
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
		const request = ctx.getRequest<Request>();
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
			err_context: exception.initName,
			message: exceptionResponse.toString(),
			error,
			Klubiq_code: errCustomCode,
			ip_address: request.headers['x-forwarded-for'] || request.ip,
			status,
			request_id: this.cls.getId(),
			stack: exception.stack,
		});
		response
			.status(status)
			.json({ ...error, status, timestamp: new Date().toISOString() });
	}
}
