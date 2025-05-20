import { Request } from 'express';

// Common cookie options
const commonCookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV !== 'local',
	sameSite: 'none' as const,
	domain: '.klubiq.com', // <-- include this
};

export const cookieConfig = {
	refreshToken: {
		name: 'refresh_token',
		options: {
			...commonCookieOptions,
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		},
	},
	accessToken: {
		name: 'access_token',
		options: {
			...commonCookieOptions,
			maxAge: 60 * 60 * 1000, // 1 hour
		},
	},
	mfaPendingCredential: {
		name: 'mfa_pending_credential',
		options: {
			...commonCookieOptions,
			maxAge: 15 * 60 * 1000, // 15 minutes
		},
	},
	mfaEnrollmentId: {
		name: 'mfa_enrollment_id',
		options: {
			...commonCookieOptions,
			maxAge: 15 * 60 * 1000, // 15 minutes
		},
	},
};

// Generic token extractor to reduce code duplication
const extractToken = (req: Request, tokenName: string): string | null => {
	// Try cookie-parser first
	const cookieToken = req.cookies?.[tokenName];
	if (cookieToken) {
		return cookieToken;
	}

	// Fallback: parse raw Cookie header
	const rawCookie = req.headers.cookie;
	if (!rawCookie) {
		return null;
	}

	const matched = rawCookie
		.split(';')
		.map((c) => c.trim())
		.find((c) => c.startsWith(`${tokenName}=`));

	if (!matched) {
		return null;
	}

	return decodeURIComponent(matched.split('=')[1]);
};

export const extractRefreshToken = (req: Request): string | null =>
	extractToken(req, cookieConfig.refreshToken.name);

export const extractAccessToken = (req: Request): string | null =>
	extractToken(req, cookieConfig.accessToken.name);

export const extractMfaPendingCredential = (req: Request): string | null =>
	extractToken(req, cookieConfig.mfaPendingCredential.name);

export const extractMfaEnrollmentId = (req: Request): string | null =>
	extractToken(req, cookieConfig.mfaEnrollmentId.name);
