import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
	trackBy(context: ExecutionContext): string | undefined {
		const request = context.switchToHttp().getRequest();
		const { method, url } = request;
		return `${method}:${url}`;
	}
}
