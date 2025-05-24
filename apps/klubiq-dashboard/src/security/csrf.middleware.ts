import {
	Injectable,
	NestMiddleware,
	UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CsrfService } from './csrf.service';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
	private readonly LANDLORD_APP_ID = process.env.LANDLORD_PORTAL_CLIENT_ID;
	private readonly CSRF_COOKIE_PREFIX = '_kbq_csrf';

	constructor(private readonly csrfService: CsrfService) {}

	async use(req: Request, res: Response, next: NextFunction) {
		const clientId = req.headers['x-client-id'];
		const tenantId = req.headers['x-tenant-id'];

		try {
			if (clientId === this.LANDLORD_APP_ID) {
				await this.handleLandlordRequest(req, res, tenantId as string);
			} else {
				await this.handleOtherClientRequest(req, res, clientId as string);
			}
			next();
		} catch (error) {
			next(error);
		}
	}

	private async handleLandlordRequest(
		req: Request,
		res: Response,
		tenantId: string,
	) {
		if (!tenantId) {
			throw new UnauthorizedException(
				'Tenant ID is required for landlord portal',
			);
		}

		const cookieKey = `${this.CSRF_COOKIE_PREFIX}-${tenantId}`;
		await this.handleCsrfToken(req, res, cookieKey, tenantId);
	}

	private async handleOtherClientRequest(
		req: Request,
		res: Response,
		clientId: string,
	) {
		const secretCombined = `${process.env.APP_SECRET}+${clientId}`;
		const cookieKey = `${this.CSRF_COOKIE_PREFIX}-tp`;
		await this.handleCsrfToken(req, res, cookieKey, secretCombined);
	}

	private async handleCsrfToken(
		req: Request,
		res: Response,
		cookieKey: string,
		secret: string,
	) {
		if (req.method === 'GET') {
			const sessionId = req.sessionID;
			const csrfToken = await this.csrfService.generateToken(secret, sessionId);
			this.setCsrfToken(req, res, cookieKey, csrfToken);
		} else {
			await this.validateCsrfToken(req, secret);
		}
	}

	private setCsrfToken(
		req: Request,
		res: Response,
		cookieKey: string,
		token: string,
	) {
		// Set cookie options based on environment
		const cookieOptions =
			process.env.NODE_ENV === 'local'
				? {
						httpOnly: true,
						secure: false,
						sameSite: 'lax' as const,
					}
				: {
						httpOnly: true,
						secure: true,
						sameSite: 'none' as const,
						domain: '.klubiq.com',
					};
		res.cookie(cookieKey, token, cookieOptions);
		// Store in session if available
		if (req.session) {
			req.session[cookieKey] = token;
		}
	}

	private async validateCsrfToken(req: Request, secret: string) {
		const csrfToken = req.headers['x-csrf-token'] as string;
		const sessionId = req.sessionID;

		if (!csrfToken || !sessionId) {
			throw new UnauthorizedException('CSRF token missing');
		}

		if (!(await this.csrfService.validateToken(secret, csrfToken, sessionId))) {
			throw new UnauthorizedException('Invalid CSRF token');
		}
	}
}
