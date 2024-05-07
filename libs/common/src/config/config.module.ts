import { Module } from '@nestjs/common';
import {
	ConfigModule as NestConfigModule,
	ConfigService,
} from '@nestjs/config';
import * as Joi from 'joi';
import { MailerSendService } from '../email/email.service';
import { MailerSendSMTPService } from '../email/smtp-email.service';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ClsModule } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';
import { CacheModule } from '@nestjs/cache-manager';
import * as redis from 'cache-manager-redis-store';

@Module({
	imports: [
		NestConfigModule.forRoot({
			validationSchema: Joi.object({
				DATABASE_HOST: Joi.string().required(),
				DATABASE_PORT: Joi.number().required(),
				DATABASE_NAME: Joi.string().required(),
				DATABASE_USERNAME: Joi.string().required(),
				DATABASE_PASSWORD: Joi.string().required(),
				SYNCHRONIZE_DB: Joi.boolean().required(),
				FIREBASE_API_KEY: Joi.string().required(),
				FIREBASE_PROJECT_ID: Joi.string().required(),
				FIREBASE_AUTH_DOMAIN: Joi.string().required(),
				FIREBASE_STORAGE_BUCKET: Joi.string().required(),
				FIREBASE_APP_ID: Joi.string().required(),
				FIREBASE_MESSAGING_SENDER_ID: Joi.string().required(),
				FIREBASE_MEASUREMENT_ID: Joi.string().required(),
				EMAIL_API_KEY: Joi.string().required(),
				HEALTH_CHECK_URL: Joi.string().required(),
				SUPPORT_EMAIL: Joi.string().required(),
				EMAIL_VERIFICATION_BASE_URL: Joi.string().required(),
				CONTINUE_URL_PATH: Joi.string().required(),
				APP_NAME: Joi.string().required(),
				APP_VERSION: Joi.string().required(),
				TRANSACTIONAL_EMAIL_SENDER: Joi.string().required(),
				TRANSACTIONAL_EMAIL_SENDER_NAME: Joi.string().required(),
				GOOGLE_IDENTITY_ENDPOINT: Joi.string().required(),
			}),
		}),
		AutomapperModule.forRoot({
			strategyInitializer: classes(),
		}),
		ClsModule.forRoot({
			global: true,
			middleware: {
				mount: true,
				generateId: true,
				idGenerator: (request: any) =>
					request.headers['x-correlation-id'] ?? uuidv4(),
				setup: (cls, req) => {
					cls.set('requestOrigin', req.headers['x-app-handler']);
				},
			},
		}),
		CacheModule.registerAsync({
			isGlobal: true,
			useFactory: async () => ({
				store: redis,
				host: 'localhost',
				port: 6379,
				max: 20,
				ttl: 10000,
			}),
		}),
	],
	providers: [ConfigService, MailerSendService, MailerSendSMTPService],
	exports: [ConfigService, MailerSendService, MailerSendSMTPService],
})
export class ConfigModule {}
