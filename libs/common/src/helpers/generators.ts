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

	generateToken(secret: string): string {
		return crypto
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
}
