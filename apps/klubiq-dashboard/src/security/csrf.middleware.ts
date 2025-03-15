import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CsrfService } from './csrf.service';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
	constructor(private readonly csrfService: CsrfService) {}

	use(req: Request, res: Response, next: NextFunction) {
		const tenantId = req.headers['x-tenant-id']; // Assume tenant ID is passed in headers
		if (!tenantId) {
			return res.status(403).send('Forbidden! You should not be here');
		}

		if (req.method === 'GET') {
			const csrfToken = this.csrfService.generateToken(tenantId as string);
			res.cookie(`_kbq_csrf-${tenantId}`, csrfToken);
			req.session[`_kbq_csrf-${tenantId}`] = csrfToken; // Store token in session or database
		} else {
			const csrfToken = req.headers['x-xsrf-token'] as string;
			const storedToken = req.session[`_kbq_csrf-${tenantId}`]; // Retrieve token from session or database
			if (
				!this.csrfService.validateToken(
					csrfToken,
					storedToken,
					tenantId as string,
				)
			) {
				return res.status(403).send('Forbidden! You should not be here');
			}
		}
		next();
	}
}
