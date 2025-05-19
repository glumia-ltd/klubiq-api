import crypto from 'crypto';
import { DateTime } from 'luxon';

// Base32 encoding (Crockford's Alphabet)
const BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export class Generators {
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
		const secret = process.env.APP_SECRET;
		const ulid = this.generateShortULID();
		const hmac = crypto
			.createHmac('sha256', secret)
			.update(ulid)
			.digest('hex')
			.slice(0, 6); // Truncate HMAC
		return ulid + hmac;
	}

	generateCsrfSecret(): string {
		const secret = process.env.APP_SECRET;
		return crypto
			.createHmac('sha256', secret)
			.update(crypto.randomBytes(32))
			.digest('hex');
	}

	generateToken(secret: string, sessionId?: string): string {
		return sessionId
			? crypto.createHmac('sha256', secret).update(sessionId).digest('hex')
			: crypto
					.createHmac('sha256', secret)
					.update(crypto.randomBytes(32))
					.digest('hex');
	}

	generateLeaseName(propertyName: string, unitName: string): string {
		// Get current timestamp in milliseconds
		const timestamp = DateTime.utc().toMillis();

		// Take first 3 characters from property name and 2 from unit name
		const propPrefix = propertyName.slice(0, 3).toUpperCase();
		const unitPrefix = unitName.slice(0, 2).toUpperCase();

		// Get last 3 digits from timestamp
		const timeSuffix = timestamp.toString().slice(-3);

		// Combine to form 8 character name (3 + 2 + 3)
		const name = `${propPrefix}${unitPrefix}${timeSuffix}`;
		return name.replace(/ /g, '-');
	}

	parseRentAmount(rentAmount: any): number {
		if (typeof rentAmount === 'string') {
			const amount = rentAmount.replace(/,/g, '');
			return Number(amount) || 0;
		}
		if (Number.isNaN(rentAmount)) {
			return 0;
		}
		return rentAmount;
	}

	generateShortJwt(
		payload: Record<string, any>,
		expiresIn: string = '1h',
	): string {
		const secret = process.env.APP_SECRET;
		if (!secret) {
			throw new Error('APP_SECRET is not defined');
		}

		// Create a minimal payload with standard JWT claims
		const minimalPayload = {
			...payload,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(expiresIn),
		};

		// Encode header
		const header = Buffer.from(
			JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
		).toString('base64url');

		// Encode payload
		const encodedPayload = Buffer.from(JSON.stringify(minimalPayload)).toString(
			'base64url',
		);

		// Create signature
		const signature = crypto
			.createHmac('sha256', secret)
			.update(`${header}.${encodedPayload}`)
			.digest('base64url');

		return `${header}.${encodedPayload}.${signature}`;
	}

	decodeShortJwt(jwt: string): Record<string, any> {
		const [header, payload, signature] = jwt.split('.');
		const secret = process.env.APP_SECRET;
		if (!secret) {
			throw new Error('APP_SECRET is not defined');
		}
		const decodedPayload = JSON.parse(
			Buffer.from(payload, 'base64url').toString('utf-8'),
		);
		const decodedSignature = crypto
			.createHmac('sha256', secret)
			.update(`${header}.${payload}`)
			.digest('base64url');
		if (decodedSignature !== signature) {
			throw new Error('Invalid signature');
		}
		return decodedPayload;
	}

	private parseExpiresIn(expiresIn: string): number {
		const unit = expiresIn.slice(-1);
		const value = parseInt(expiresIn.slice(0, -1));

		switch (unit) {
			case 's':
				return value;
			case 'm':
				return value * 60;
			case 'h':
				return value * 3600;
			case 'd':
				return value * 86400;
			default:
				return 3600; // Default to 1 hour
		}
	}
}
