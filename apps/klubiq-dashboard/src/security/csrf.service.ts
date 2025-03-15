import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Generators } from '@app/common/helpers/generators';
import { validate as uuidValidate } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '@app/common/database/entities/organization.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class CsrfService {
	constructor(
		private readonly generators: Generators,
		@InjectRepository(Organization)
		private readonly tenantRepository: Repository<Organization>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async generateToken(tenantId: string): Promise<string> {
		const secret = await this.getTenantSecret(tenantId);
		return this.generators.generateToken(secret);
	}

	async validateToken(
		tenantId: string,
		token: string,
		storedToken: string,
	): Promise<boolean> {
		const secret = await this.getTenantSecret(tenantId);
		const expectedToken = crypto
			.createHmac('sha256', secret)
			.update(storedToken)
			.digest('hex');
		return token === expectedToken;
	}

	private async getTenantSecret(tenantId: string): Promise<string> {
		const cacheKey = `tokens:csrf:${tenantId}`;
		const cachedSecret = await this.cacheManager.get<string>(cacheKey);
		if (cachedSecret) {
			return cachedSecret;
		}
		const tenant = await this.tenantRepository.findOne({
			where: uuidValidate(tenantId)
				? { organizationUuid: tenantId }
				: { tenantId: tenantId },
		});
		if (!tenant) {
			throw new Error(`No secret found for tenant: ${tenantId}`);
		}
		await this.cacheManager.set(cacheKey, tenant.csrfSecret, 600);
		return tenant.csrfSecret;
	}
}
