import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ApikeyGuard implements CanActivate {
	constructor(private readonly configService: ConfigService) {}
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		const apiKey = this.extractKeyFromHeader(request);
		if (!apiKey) throw new Error('API Key not found.');
		try {
			const adminApiKey = this.configService.getOrThrow('ADMIN_API_KEY'); //use temporarily for admin access
			return adminApiKey === apiKey;
		} catch {
			throw new Error('Invalid API Key');
		}
	}

	private extractKeyFromHeader(request: Request): string | undefined {
		const [type, key] = request.headers.authorization?.split(' ') ?? [];
		return type === 'ApiKey' ? key : undefined;
	}
}
