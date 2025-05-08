import { Request } from 'express';

export const cookieConfig = {
	refreshToken: {
		name: 'refresh_token',
		options: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		},
	},
	accessToken: {
		name: 'access_token',
		options: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			maxAge: 60 * 60 * 1000, // 1 hour
		},
	},
};

export const extractRefreshToken = (req: Request): string | null => {
	const { name } = cookieConfig.refreshToken;
	// Try cookie-parser first
	const cookieToken = req.cookies?.[name];
	if (cookieToken) {
		return cookieToken;
	}
	// Fallback: parse raw Cookie header if cookie-parser isn't used
	const rawCookie = req.headers.cookie;
	if (!rawCookie) {
		return null;
	}
	const matched = rawCookie
		.split(';')
		.map((c) => c.trim())
		.find((c) => c.startsWith(`${name}=`));
	if (!matched) {
		return null;
	}
	// decode in case the value was URL-encoded
	return decodeURIComponent(matched.split('=')[1]);
};

export const extractAccessToken = (req: Request): string | null => {
	const { name } = cookieConfig.accessToken;
	// Try cookie-parser first
	const cookieToken = req.cookies?.[name];
	if (cookieToken) {
		return cookieToken;
	}
	// Fallback: parse raw Cookie header if cookie-parser isn't used
	const rawCookie = req.headers.cookie;
	if (!rawCookie) {
		return null;
	}
	const matched = rawCookie
		.split(';')
		.map((c) => c.trim())
		.find((c) => c.startsWith(`${name}=`));
	if (!matched) {
		return null;
	}
	// decode in case the value was URL-encoded
	return decodeURIComponent(matched.split('=')[1]);
};
