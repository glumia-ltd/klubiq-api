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

	use(req: Request, res: Response, next: NextFunction) {
		const clientId = req.headers['x-client-id'];
		const tenantId = req.headers['x-tenant-id'];

		try {
			if (clientId === this.LANDLORD_APP_ID) {
				this.handleLandlordRequest(req, res, tenantId as string);
			} else {
				this.handleOtherClientRequest(req, res, clientId as string);
			}
			next();
		} catch (error) {
			throw new UnauthorizedException('CSRF validation failed');
		}
	}

	private handleLandlordRequest(req: Request, res: Response, tenantId: string) {
		if (!tenantId) {
			throw new UnauthorizedException(
				'Tenant ID is required for landlord portal',
			);
		}

		const cookieKey = `${this.CSRF_COOKIE_PREFIX}-${tenantId}`;
		this.handleCsrfToken(req, res, cookieKey, tenantId);
	}

	private handleOtherClientRequest(
		req: Request,
		res: Response,
		clientId: string,
	) {
		const secretCombined = `${process.env.APP_SECRET}+${clientId}`;
		const cookieKey = `${this.CSRF_COOKIE_PREFIX}-tp`;
		this.handleCsrfToken(req, res, cookieKey, secretCombined);
	}

	private async handleCsrfToken(
		req: Request,
		res: Response,
		cookieKey: string,
		secret: string,
	) {
		if (req.method === 'GET') {
			const csrfToken = await this.csrfService.generateToken(secret);
			this.setCsrfToken(req, res, cookieKey, csrfToken);
		} else {
			this.validateCsrfToken(req, cookieKey, secret);
		}
	}

	private setCsrfToken(
		req: Request,
		res: Response,
		cookieKey: string,
		token: string,
	) {
		res.cookie(cookieKey, token);
		req.session[cookieKey] = token;
	}

	private validateCsrfToken(req: Request, cookieKey: string, secret: string) {
		const csrfToken = req.headers['x-xsrf-token'] as string;
		const storedToken = req.session[cookieKey];

		if (!this.csrfService.validateToken(csrfToken, storedToken, secret)) {
			throw new UnauthorizedException('Invalid CSRF token');
		}
	}
}
