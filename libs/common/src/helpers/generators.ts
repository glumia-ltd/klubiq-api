import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

// Base32 encoding (Crockford’s Alphabet)
const BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export class Generators {
	private readonly configService: ConfigService;

	constructor(configService: ConfigService) {
		this.configService = configService;
	}

	// Convert a number to a Base32 string
	encodeBase32(number: number, length: number): string {
		let encoded = '';
		while (length-- > 0) {
			encoded = BASE32_ALPHABET[number % 32] + encoded;
			number = Math.floor(number / 32);
		}
		return encoded;
	}

	// Generate a shorter ULID (12 characters)
	generateShortULID = (): string => {
		// 1. Shorter Timestamp (40-bit, 8 chars in Base32)
		const timestamp = Date.now();
		const timestampBase32 = this.encodeBase32(timestamp, 8);

		// 2. Shorter Random Component (20-bit, 4 random chars)
		const randomBytes = crypto.randomBytes(2); // 16 bits (2 bytes)
		let randomBase32 = '';
		for (let i = 0; i < randomBytes.length; i++) {
			randomBase32 += BASE32_ALPHABET[randomBytes[i] % 32];
		}

		return timestampBase32 + randomBase32;
	};

	generateSecureULID(): string {
		const secret = this.configService.get('APP_SECRET');
		const ulid = this.generateShortULID();
		const hmac = crypto
			.createHmac('sha256', secret)
			.update(ulid)
			.digest('hex')
			.slice(0, 6); // Truncate HMAC
		return ulid + hmac;
	}

	generateCsrfSecret(): string {
		const secret = this.configService.get('APP_SECRET');
		return crypto
			.createHmac('sha256', secret)
			.update(crypto.randomBytes(32))
			.digest('hex');
	}

	generateToken(secret: string): string {
		return crypto
			.createHmac('sha256', secret)
			.update(crypto.randomBytes(32))
			.digest('hex');
	}
}
