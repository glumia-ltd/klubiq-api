import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpStatus } from '@nestjs/common';
import { Request,Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data: any) => this.responseHandler(data, context)));
  }
  responseHandler(data: any, context: ExecutionContext): any {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = response.statusCode || HttpStatus.OK;
    const status = statusCode < 300 ? 'success' : 'error';

    return {
      status,
      path: request.path,
      statusCode,
      message: response.statusMessage ?? null,
      data: data,
    }
  }

}
