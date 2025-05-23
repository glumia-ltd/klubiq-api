import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import {
	SwaggerModule,
	DocumentBuilder,
	SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { KlubiqDashboardModule } from './klubiq-dashboard.module';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { HttpResponseInterceptor } from '@app/common/interceptors/http-response.interceptor';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import express, { Request, Response } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import swaggerUiDist from 'swagger-ui-dist';
import { CustomLogging } from '@app/common';
import { WinstonModule } from 'nest-winston';

declare const module: any;

async function bootstrap() {
	//await repl(KlubiqDashboardModule);

	const customLogger = new CustomLogging(new ConfigService()); // Create an instance of ConfigService
	const app = await NestFactory.create<NestExpressApplication>(
		KlubiqDashboardModule,
		{
			logger: WinstonModule.createLogger(customLogger.createLoggerConfig),
			snapshot: true,
		},
	);
	const expressApp = app.getHttpAdapter().getInstance();

	const configService = app.get(ConfigService);
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					scriptSrc: [
						"'self'",
						'https://maps.googleapis.com',
						"'unsafe-inline'",
					], // Adjust as needed
					styleSrc: ["'self'", "'unsafe-inline'"], // Adjust as needed
					imgSrc: [
						"'self'",
						'data:',
						'https:',
						'https://maps.googleapis.com',
						'https://maps.gstatic.com',
					], // Allow images from self, data URIs, and HTTPS
					frameSrc: ["'self'", 'https://*.klubiq.com'], // Allow frames from self and Klubiq domains
					connectSrc: [
						"'self'",
						'https://maps.googleapis.com',
						'https://identitytoolkit.googleapis.com',
						'https://securetoken.googleapis.com',
						'https://*.klubiq.com',
					], // Allow connections to your API
					fontSrc: [
						"'self'",
						'https://fonts.gstatic.com',
						'https://fonts.googleapis.com',
					], // Allow fonts from Google Fonts
					objectSrc: ["'none'"], // Disallow <object>, <embed>, <applet> elements
					upgradeInsecureRequests: [], // Automatically upgrade HTTP requests to HTTPS
				},
				// Add reportUri to monitor CSP violations
			},
			referrerPolicy: { policy: 'no-referrer' }, // Set referrer policy
			frameguard: { action: 'deny' }, // Prevent clickjacking
			hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // HTTP Strict Transport Security
			noSniff: true, // Prevent MIME type sniffing
			xssFilter: true, // Enable XSS filter
		}),
	);
	app.use(
		session({
			secret: process.env.APP_SECRET,
			resave: false,
			saveUninitialized: false,
			cookie:
				process.env.NODE_ENV !== 'local'
					? {
							sameSite: 'none' as const,
							httpOnly: true,
							secure: process.env.NODE_ENV !== 'local',
							domain: '.klubiq.com',
							maxAge: 1000 * 60 * 60 * 24, // 1 day
						}
					: {
							sameSite: 'lax' as const,
							httpOnly: true,
							secure: false,
							maxAge: 1000 * 60 * 60 * 24, // 1 day
						},
		}),
	);
	app.setGlobalPrefix('/api');
	/// SWAGGER CONFIGURATION
	const options: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
	};
	const swaggerConfig = new DocumentBuilder()
		.setTitle('Klubiq PMS')
		.setDescription('Klubiq PMS API')
		.setVersion('1.0')
		.addServer('http://localhost:3000/')
		.addServer('https://devapi.klubiq.com/')
		//.addTag('Klubiq')
		.setContact('Glumia Support', 'glumia.ng', 'info@glumia.ng')
		.addBearerAuth()
		.addSecurity('ApiKey', {
			type: 'apiKey',
			in: 'header',
			name: 'Authorization',
			scheme: 'ApiKeyAuth',
		})
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig, options);

	// Serve filtered Swagger JSON
	expressApp.get('/api-json', (req: Request, res: Response) => {
		const doesQueryExist: any = req.query.role;

		const excludedPaths = ['/api/auth/verify-email']; // I added this for test purposes. This will be referenced from env later on.
		const filteredPaths: Record<string, any> = {};

		Object.keys(document.paths).forEach((path) => {
			if (shouldExcludeRoute(path, doesQueryExist, excludedPaths)) {
				return;
			}
			filteredPaths[path] = document.paths[path];
		});

		const filteredDocument = {
			...document,
			paths: filteredPaths,
		};

		res.json(filteredDocument);
	});

	// Serve Swagger UI manually at /swagger
	const swaggerUiPath = swaggerUiDist.getAbsoluteFSPath();
	expressApp.use('/swagger-assets', express.static(swaggerUiPath));

	expressApp.get('/swagger', (req: Request, res: Response) => {
		const roleValue = req.query.role ?? '';
		const swaggerUrl = `/api-json${roleValue ? `?role=${roleValue}` : ''}`;
		res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Swagger UI</title>
        <link rel="stylesheet" href="/swagger-assets/swagger-ui.css" />
        <link rel="stylesheet" href="/swagger-assets/index.css" />
        <style>html, body { margin: 0; padding: 0; height: 100%; }</style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="/swagger-assets/swagger-ui-bundle.js"></script>
        <script src="/swagger-assets/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function () {
            SwaggerUIBundle({
              url: '${swaggerUrl}',
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
      </html>
    `);
	});

	/// APP SETTINGS
	const allowedOrigins =
		process.env.NODE_ENV === 'production'
			? [
					'https://app.klubiq.com',
					'https://dashboard.klubiq.com',
					'https://admin.klubiq.com',
					'https://api.klubiq.com',
				]
			: [
					'http://localhost:3000',
					'http://localhost:3001',
					'http://localhost:3002',
					'http://localhost:3003',
					'http://localhost:3004',
					'http://localhost:3005',
					'http://localhost:3006',
					'http://localhost:3007',
					'http://localhost:3008',
					'http://localhost:3009',
					'http://localhost:5173',
					'http://localhost:5174',
					'https://dev.klubiq.com',
					'https://dev-tenant.klubiq.com',
					'https://devapi.klubiq.com',
					'http://local.klubiq.com:5173',
				];
	app.enableCors({
		// Allow CORS from any origin by echoing back the request's Origin header
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		// Use HTTP 204 (No Content) for successful preflight (OPTIONS) requests
		optionsSuccessStatus: 204,
		// Allow cookies and authentication info to be sent in cross-origin requests
		credentials: true,
	});
	app.enableVersioning({
		type: VersioningType.URI,
	});
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalInterceptors(new HttpResponseInterceptor());

	await app.listen(configService.get('APP_PORT') || 3000);

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
}
bootstrap();

const shouldExcludeRoute = (
	path: string,
	roleValue: string,
	excludedPaths: string[],
): boolean => {
	// value to check with to be agreed on
	if (roleValue == 'isAdmin') {
		return false;
	}
	return excludedPaths.some((excludedPath) => path.startsWith(excludedPath));
};
